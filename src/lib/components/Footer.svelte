<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	const branches = [
		'Jemous, Saint Therese facing bab l hara',
		'Mansourieh main road, facing Brands & Beyond',
		'Furn el Chebbek facing Mega Mall'
	];

	let branchesOpen = $state(true);
	let contactOpen = $state(true);
	let browseOpen = $state(true);

	const setFooterSections = (open: boolean) => {
		branchesOpen = open;
		contactOpen = open;
		browseOpen = open;
	};

	onMount(() => {
		const mediaQuery = window.matchMedia('(min-width: 701px)');
		const syncFooterMode = () => {
			setFooterSections(mediaQuery.matches);
		};

		syncFooterMode();
		mediaQuery.addEventListener('change', syncFooterMode);

		return () => mediaQuery.removeEventListener('change', syncFooterMode);
	});
</script>

<footer class="site-footer">
	<div class="site-footer__inner footer-layout">
		<section class="footer-newsletter">
			<div class="stack" style="gap: 0.55rem;">
				<p class="footer-title">Let's get in touch</p>
				<!-- <p class="footer-copy">
					Join our community and be the first to discover our latest stories, trends, and releases.
				</p> -->
			</div>

			<form class="footer-subscribe" action="#" method="post">
				<label class="footer-subscribe__field">
					<span class="sr-only">Email address</span>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M4 6.75h16a1.25 1.25 0 0 1 1.25 1.25v8A1.25 1.25 0 0 1 20 17.25H4A1.25 1.25 0 0 1 2.75 16V8A1.25 1.25 0 0 1 4 6.75Zm0 1.5-.13.01L12 13.47l8.13-5.21A.7.7 0 0 0 20 8.25H4Zm16 7.5.13-.01L14.5 12.1l-2.1 1.34a.75.75 0 0 1-.8 0L9.5 12.1l-5.63 3.64a.7.7 0 0 0 .13.01h16Z"
						/>
					</svg>
					<input type="email" placeholder="Enter your email" />
				</label>
				<button type="submit" class="footer-subscribe__button" aria-label="Subscribe">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M5.75 12a.75.75 0 0 1 .75-.75h9.69l-3.22-3.22a.75.75 0 1 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H6.5a.75.75 0 0 1-.75-.75Z"
						/>
					</svg>
				</button>
			</form>
		</section>

		<section class="footer-brand-block">
			<a class="footer-brand" href={resolve('/')} aria-label="Vitto Shoes home">
				<img
					class="brand-logo brand-logo--footer"
					src="/Viito Logo-01.png"
					alt="Vitto Shoes"
					style="margin-left: -11px;"
				/>
			</a>
			<p class="footer-copy footer-brand-copy">
				A shoe brand born with years of experience since 1999. From women to men and kids, our
				collections are designed for the whole family, combining elegance, comfort, and durability.
			</p>
		</section>

		<div class="footer-columns">
			<section class="footer-accordion" class:is-open={branchesOpen}>
				<button
					type="button"
					class="footer-accordion__summary"
					aria-expanded={branchesOpen}
					onclick={() => (branchesOpen = !branchesOpen)}
				>
					<span class="footer-column-heading">Branches</span>
					<span class="footer-accordion__chevron">&#9662;</span>
				</button>
				{#if branchesOpen}
					<div class="footer-accordion__content">
						<ul class="footer-list footer-branches">
							{#each branches as branch (branch)}
								<li>
									<!-- <span class="footer-pin" aria-hidden="true"></span> -->
									<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
										><path
											fill="#111111"
											d="M12 2C7.589 2 4 5.589 4 9.995C3.971 16.44 11.696 21.784 12 22c0 0 8.029-5.56 8-12c0-4.411-3.589-8-8-8m0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4s4 1.79 4 4s-1.79 4-4 4"
										/></svg
									>
									<span>{branch}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</section>

			<section class="footer-accordion" class:is-open={contactOpen}>
				<button
					type="button"
					class="footer-accordion__summary"
					aria-expanded={contactOpen}
					onclick={() => (contactOpen = !contactOpen)}
				>
					<span class="footer-column-heading">Contact Us</span>
					<span class="footer-accordion__chevron">&#9662;</span>
				</button>
				{#if contactOpen}
					<div class="footer-accordion__content">
						<div class="footer-list">
							<a href="tel:03888173">03 888 173</a>
							<a href="mailto:Info@vittoshoes.com">Info@vittoshoes.com</a>
							<a href="https://wa.me/9613888173" target="_blank" rel="noreferrer">WhatsApp orders</a
							>
						</div>
					</div>
				{/if}
			</section>

			<section class="footer-accordion" class:is-open={browseOpen}>
				<button
					type="button"
					class="footer-accordion__summary"
					aria-expanded={browseOpen}
					onclick={() => (browseOpen = !browseOpen)}
				>
					<span class="footer-column-heading">Browse</span>
					<span class="footer-accordion__chevron">&#9662;</span>
				</button>
				{#if browseOpen}
					<div class="footer-accordion__content">
						<div class="footer-list">
							<a href={resolve('/shop')}>Shop all</a>
							<a href={resolve('/sale')}>On sale</a>
							<a href={resolve('/cart')}>Cart</a>
						</div>
					</div>
				{/if}
			</section>
		</div>

		<div class="footer-bottom">
			<p class="footer-copy footer-copyright">
				Copyright &copy; 2026 Vitto Shoes.
				<a href="https://www.linkedin.com/company/pixelerion" target="_blank" rel="noreferrer"
					>By Pixelerion.</a
				>
			</p>

			<div class="footer-socials" aria-label="Social media">
				<a
					href="https://www.facebook.com/share/1LKMxzKEzC/?mibextid=wwXIfr"
					target="_blank"
					rel="noreferrer"
					aria-label="Facebook"
				>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M13.32 21v-7.7h2.58l.39-3h-2.97V8.38c0-.87.24-1.46 1.49-1.46h1.59V4.24c-.28-.04-1.23-.12-2.34-.12-2.32 0-3.91 1.42-3.91 4.02v2.16H7.5v3h2.64V21h3.18Z"
						/>
					</svg>
				</a>
				<a
					href="https://www.instagram.com/vitto.shoes?igsh=Y3k3b3Mybm9kaTB2"
					target="_blank"
					rel="noreferrer"
					aria-label="Instagram"
				>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M7.75 3h8.5A4.75 4.75 0 0 1 21 7.75v8.5A4.75 4.75 0 0 1 16.25 21h-8.5A4.75 4.75 0 0 1 3 16.25v-8.5A4.75 4.75 0 0 1 7.75 3Zm0 1.5A3.25 3.25 0 0 0 4.5 7.75v8.5a3.25 3.25 0 0 0 3.25 3.25h8.5a3.25 3.25 0 0 0 3.25-3.25v-8.5A3.25 3.25 0 0 0 16.25 4.5h-8.5Zm8.88 1.12a.88.88 0 1 1 0 1.76.88.88 0 0 1 0-1.76ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Z"
						/>
					</svg>
				</a>
				<a href="https://wa.me/9613888173" target="_blank" rel="noreferrer" aria-label="WhatsApp">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M12 3.75A8.25 8.25 0 0 0 5.04 16.43L4 20.25l3.94-1.03A8.25 8.25 0 1 0 12 3.75Zm0 15a6.72 6.72 0 0 1-3.42-.93l-.24-.14-2.34.61.62-2.28-.15-.24A6.75 6.75 0 1 1 12 18.75Zm3.71-5.1c-.2-.1-1.16-.57-1.34-.64-.18-.07-.31-.1-.44.1-.13.2-.5.63-.62.77-.11.13-.22.15-.41.05-.2-.1-.83-.3-1.58-.96-.59-.52-.98-1.16-1.09-1.35-.11-.2-.01-.3.08-.4.08-.08.2-.22.29-.33.1-.11.13-.19.2-.32.07-.13.03-.24-.02-.33-.05-.1-.44-1.06-.6-1.45-.16-.38-.33-.33-.44-.34h-.38c-.13 0-.33.05-.5.24-.17.2-.67.65-.67 1.59 0 .94.69 1.84.79 1.96.1.13 1.36 2.07 3.3 2.9.46.2.81.32 1.09.41.46.14.88.12 1.21.07.37-.06 1.16-.47 1.32-.92.16-.45.16-.83.11-.92-.04-.09-.17-.14-.37-.24Z"
						/>
					</svg>
				</a>
				<a
					href="https://www.tiktok.com/@vitto..shoes"
					target="_blank"
					rel="noreferrer"
					aria-label="TikTok"
				>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M14.2 3.5h2.6c.3 2.1 1.5 3.7 3.7 4v2.7c-1.4 0-2.7-.4-3.8-1.2v5.8c0 3.3-2.1 5.7-5.6 5.7-3 0-5.3-2-5.3-4.9 0-3.2 2.5-5.1 5.7-5.1.4 0 .7 0 1 .1v2.8a4 4 0 0 0-1.1-.1c-1.5 0-2.6.8-2.6 2.2 0 1.3 1 2.1 2.3 2.1 1.7 0 2.5-1 2.5-2.8V3.5h.6Z"
						/>
					</svg>
				</a>
			</div>
		</div>
	</div>
</footer>
