<script lang="ts">
	import { resolve } from '$app/paths';

	const branches = [
		'Tayouneh area main road near Adam bakery.',
		'Zalka wooden bakery junction near Diwan Hachem restaurant.',
		"Kaslik main street facing Lina's cafe."
	];
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
				<img class="brand-logo brand-logo--footer" src="/Viito Logo-01.png" alt="Vitto Shoes" />
			</a>
			<p class="footer-copy footer-brand-copy">
				A shoe brand born with years of experience since 1999. From women to men and kids, our
				collections are designed for the whole family, combining elegance, comfort, and durability.
			</p>
		</section>

		<div class="footer-columns">
			<details class="footer-accordioj" open>
				<summary class="footer-accordion__summary">
					<span style="font-size: 1rem; text-transform: uppercase;">Branches</span>
					<span class="footer-accordion__chevron">&#9652;</span>
				</summary>
				<div class="footer-accordion__content">
					<ul class="footer-list footer-branches">
						{#each branches as branch (branch)}
							<li>
								<span class="footer-pin" aria-hidden="true"></span>
								<span>{branch}</span>
							</li>
						{/each}
					</ul>
				</div>
			</details>

			<details class="footer-accordion" open>
				<summary class="footer-accordion__summary">
					<span style="font-size: 1rem; text-transform: uppercase;">Contact Us</span>
					<span class="footer-accordion__chevron">&#9652;</span>
				</summary>
				<div class="footer-accordion__content">
					<div class="footer-list">
						<a href="tel:+96170000000">+961 70 000 000</a>
						<a href="mailto:hello@vitto-shoes.com">hello@vitto-shoes.com</a>
						<a href="https://wa.me/96170000000" target="_blank" rel="noreferrer">WhatsApp orders</a>
					</div>
				</div>
			</details>

			<div class="footer-links">
				<p class="footer-title">Browse</p>
				<div class="footer-list">
					<a href={resolve('/shop')}>Shop all</a>
					<a href={resolve('/sale')}>On sale</a>
					<a href={resolve('/cart')}>Cart</a>
				</div>
			</div>
		</div>

		<div class="footer-bottom">
			<p class="footer-copy footer-copyright">
				Copyright &copy; 2026 Vitto Shoes.
				<a href="https://www.linkedin.com/company/pixelerion" target="_blank" rel="noreferrer"
					>By Pixelerion.</a
				>
			</p>

			<div class="footer-socials" aria-label="Social media">
				<a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M13.32 21v-7.7h2.58l.39-3h-2.97V8.38c0-.87.24-1.46 1.49-1.46h1.59V4.24c-.28-.04-1.23-.12-2.34-.12-2.32 0-3.91 1.42-3.91 4.02v2.16H7.5v3h2.64V21h3.18Z"
						/>
					</svg>
				</a>
				<a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M7.75 3h8.5A4.75 4.75 0 0 1 21 7.75v8.5A4.75 4.75 0 0 1 16.25 21h-8.5A4.75 4.75 0 0 1 3 16.25v-8.5A4.75 4.75 0 0 1 7.75 3Zm0 1.5A3.25 3.25 0 0 0 4.5 7.75v8.5a3.25 3.25 0 0 0 3.25 3.25h8.5a3.25 3.25 0 0 0 3.25-3.25v-8.5A3.25 3.25 0 0 0 16.25 4.5h-8.5Zm8.88 1.12a.88.88 0 1 1 0 1.76.88.88 0 0 1 0-1.76ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Z"
						/>
					</svg>
				</a>
				<a href="https://wa.me/" target="_blank" rel="noreferrer" aria-label="WhatsApp">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M12 3.75A8.25 8.25 0 0 0 5.04 16.43L4 20.25l3.94-1.03A8.25 8.25 0 1 0 12 3.75Zm0 15a6.72 6.72 0 0 1-3.42-.93l-.24-.14-2.34.61.62-2.28-.15-.24A6.75 6.75 0 1 1 12 18.75Zm3.71-5.1c-.2-.1-1.16-.57-1.34-.64-.18-.07-.31-.1-.44.1-.13.2-.5.63-.62.77-.11.13-.22.15-.41.05-.2-.1-.83-.3-1.58-.96-.59-.52-.98-1.16-1.09-1.35-.11-.2-.01-.3.08-.4.08-.08.2-.22.29-.33.1-.11.13-.19.2-.32.07-.13.03-.24-.02-.33-.05-.1-.44-1.06-.6-1.45-.16-.38-.33-.33-.44-.34h-.38c-.13 0-.33.05-.5.24-.17.2-.67.65-.67 1.59 0 .94.69 1.84.79 1.96.1.13 1.36 2.07 3.3 2.9.46.2.81.32 1.09.41.46.14.88.12 1.21.07.37-.06 1.16-.47 1.32-.92.16-.45.16-.83.11-.92-.04-.09-.17-.14-.37-.24Z"
						/>
					</svg>
				</a>
			</div>
		</div>
	</div>
</footer>
