import { applyAction, deserialize } from '$app/forms';

type UploadEnhanceOptions = {
	onStart?: () => void;
	onProgress?: (progress: number) => void;
	onFinish?: () => void;
	onError?: (message: string) => void;
	validate?: (formData: FormData) => string | null;
};

export function uploadEnhance(node: HTMLFormElement, options: UploadEnhanceOptions = {}) {
	let currentOptions = options;

	function resolveActionUrl(
		form: HTMLFormElement,
		submitter: HTMLButtonElement | HTMLInputElement | null
	) {
		const rawAction =
			submitter?.getAttribute('formaction') || form.getAttribute('action') || window.location.href;

		return new URL(rawAction, window.location.href).toString();
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const submitter = event.submitter as HTMLButtonElement | HTMLInputElement | null;
		const action = resolveActionUrl(node, submitter);
		const method = (submitter?.formMethod || node.method || 'POST').toUpperCase();
		const formData = new FormData(node, submitter ?? undefined);
		const validationError = currentOptions.validate?.(formData);

		if (validationError) {
			currentOptions.onError?.(validationError);
			return;
		}

		currentOptions.onStart?.();

		const xhr = new XMLHttpRequest();
		xhr.open(method, action, true);
		xhr.setRequestHeader('accept', 'application/json');
		xhr.setRequestHeader('x-sveltekit-action', 'true');

		xhr.upload.addEventListener('progress', (progressEvent) => {
			if (!progressEvent.lengthComputable) return;
			const progress = Math.min(
				100,
				Math.round((progressEvent.loaded / Math.max(progressEvent.total, 1)) * 100)
			);
			currentOptions.onProgress?.(progress);
		});

		xhr.addEventListener('load', async () => {
			if (xhr.status === 413) {
				currentOptions.onError?.(
					'Upload failed: the file is too large for the server limit. Please use a smaller image.'
				);
				return;
			}

			if (xhr.status >= 400) {
				currentOptions.onError?.('Upload failed. Please check the file and try again.');
				return;
			}

			try {
				currentOptions.onProgress?.(100);
				const result = deserialize(xhr.responseText);
				await applyAction(result);
				currentOptions.onFinish?.();
			} catch {
				currentOptions.onError?.('Upload failed. Please try again.');
			}
		});

		xhr.addEventListener('error', () => {
			currentOptions.onError?.('Upload failed. Please try again.');
		});

		xhr.send(formData);
	}

	node.addEventListener('submit', handleSubmit);

	return {
		update(nextOptions: UploadEnhanceOptions) {
			currentOptions = nextOptions;
		},
		destroy() {
			node.removeEventListener('submit', handleSubmit);
		}
	};
}
