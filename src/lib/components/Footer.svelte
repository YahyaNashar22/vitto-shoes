<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<footer class="site-footer">
	<div>
		<a class="footer-brand" href={resolve('/')} aria-label="Vitto Shoes home">
			<img class="brand-logo brand-logo--footer" src="/Viito Logo-03.png" alt="Vitto Shoes" />
		</a>
		<p class="footer-copy">
			Neutral-toned footwear, fast browsing, and WhatsApp-first cash-on-delivery checkout.
		</p>
	</div>
	<div>
		<p class="footer-title">Browse</p>
		<a href={resolve('/shop')}>Shop all</a>
		<a href={resolve('/sale')}>On sale</a>
		<a href={resolve('/cart')}>Cart</a>
	</div>
	<div>
		<p class="footer-title">Admin</p>
		<a href={resolve('/admin')}>Dashboard</a>
		<a href={resolve('/admin/catalog')}>Catalog</a>
		<a href={resolve('/admin/orders')}>Orders</a>
	</div>
</footer>
