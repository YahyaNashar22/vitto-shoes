import { applyAction, deserialize } from '$app/forms';

type UploadEnhanceOptions = {
	onStart?: () => void;
	onProgress?: (progress: number) => void;
	onFinish?: () => void;
	onError?: (message: string) => void;
};

export function uploadEnhance(node: HTMLFormElement, options: UploadEnhanceOptions = {}) {
	let currentOptions = options;

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const submitter = event.submitter as HTMLButtonElement | HTMLInputElement | null;
		const action = submitter?.formAction || node.action;
		const method = (submitter?.formMethod || node.method || 'POST').toUpperCase();
		const formData = new FormData(node, submitter ?? undefined);

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
