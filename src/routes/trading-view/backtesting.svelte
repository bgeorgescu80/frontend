<script context="module">
	import { browser, dev } from '$app/env';
	import { backendUrl } from '$lib/config';
	import breadcrumbTranslations, {buildBreadcrumbs} from "$lib/breadcrumb/builder";

	export const hydrate = true;

	// ...but if the client-side router is already loaded
	// (i.e. we came here from elsewhere in the app), use it
	export const router = browser;

	// https://gist.github.com/acoyfellow/a94f020245d4bfcd4c5d9ddc8f86a98a
	export async function load({ url, session, fetch, context }) {
		const apiUrl = `${backendUrl}/datasets`;

		const res = await fetch(apiUrl, {
			// When we are doing server-side rendering, we are shortcutting the public Internet and directly hitting the internal API.
			// See hooks/index.ts for more information.
			// However, in this case, the backend does not know our domain name. For this particular API call,
			// The backend is using Pyramid request.route_url() function to generate download URLs.
			// This is different from hitting the API from the client side, because in that case these
			// fields would be correct, and also overwritten by the web browser / Cloudflare.
			headers: {
				'X-Forwarded-Host': "tradingstrategy.ai",
				'X-Forwarded-Proto': "https",
				'Host': "tradingstrategy.ai",
			}
		});

		const datasets = await res.json();

		const readableNames = {
			...breadcrumbTranslations
      	};

		if (res.ok) {
			return {
				props: {
					datasets,
					breadcrumbs: buildBreadcrumbs(url.pathname, readableNames)
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`),
		};
	}

</script>

<script>
	import Time from "svelte-time";
	import Spinner from 'svelte-spinner';
	import Breadcrumb from '$lib/breadcrumb/Breadcrumb.svelte';

	export let datasets;
	export let submitting = false;
	export let validApiKey = null;
	export let apiKeyError = null;

	export let breadcrumbs;

	function formatNumber(n) {
		if(n <= 1000) {
			return (n/1000).toLocaleString("en",  {minimumFractionDigits: 3, maximumFractionDigits: 3})
		} else{
			return (n/1000).toLocaleString("en",  {minimumFractionDigits: 0, maximumFractionDigits: 0})
		}
	}

	function formatSize(n) {
		if(n <= 1024*1024) {
			return (n/(1024*1024)).toLocaleString("en",  {minimumFractionDigits: 3, maximumFractionDigits: 3})
		} else{
			return (n/(1024*1024)).toLocaleString("en",  {minimumFractionDigits: 0, maximumFractionDigits: 0})
		}
	}

	function formatDownloadLink(key, link) {
		// Cannot downlaod without API key
		if(!validApiKey) {
			return "javascript:";
		}

		const url = new URL(link);
		url.searchParams.set("api-key", key);
		return url.toString();
	}

	async function handleSubmit(event) {

		const url = `${backendUrl}/validate-api-key`;
		let key = event.target.apiKey.value;

		// Avoid whitespace issues
		key = key.trim();

		apiKeyError = null;
		submitting = true;

		try {

			// https://stackoverflow.com/a/53189376/315168
			//console.log("Posting to", url);
			const res = await fetch(url, {
				method: 'POST',
				body: new URLSearchParams({key}),
			});

			if(res.status != 200) {
				apiKeyError = `Server failure: ${res.status} ${res.statusText}`;
				return;
			}

			const data = await res.json();

			// console.log("Got validation response", data);

			if (!data.valid) {
				apiKeyError = "The API key is not valid";
				return;
			}

			validApiKey = key;

		} catch(e) {
			apiKeyError = e.toString();
		} finally {
			submitting = false;
		}
	}

</script>

<svelte:head>
	<title>Historical DEX trading data</title>
	<meta name="description" content="Download price, OHLCV and liquidity backtesting data">
</svelte:head>

<div class="container container-main">
	<Breadcrumb breadcrumbs={breadcrumbs} />
	<section class="md-12">
		<div class="card">
			<div class="card-body">
				<h1>Historical DEX trading data</h1>

				<p>
					Trading Strategy protocol datasets are available for decentralised finance (DeFi) research,
					cryptocurrency algorithmic trading, automated trading strategy research and execution.
				</p>

				<p>
					You can download the datasets with an API key. Request an API key via Discord or get one automatically
					by completing  <a rel="external" href="https://tradingstrategy.ai/docs/programming/examples/getting-started.html">Trading Strategy Python client tutorial.</a>
				</p>

				<h2>Supported blockchains and DEXes</h2>

				<p>
					The datasets include trade and liquidity data for <a rel="external" href="https://tradingstrategy.ai/docs/glossary.html#term-AMM">automatic market maker (AMM)</a> exchanges.
					For <a href="https://tradingstrategy.ai/trading-view/blockchains">the list of supported blockchains and exchanges, view trading data on Trading Strategy website.</a>
				</p>

				<h2>Data logistics</h2>

				<p>
					Datasets are distributed in <a href="https://parquet.apache.org/">Parquet</a> file format
					designed for data research. Parquet is a columnar data format for high performance in-memory datasets from Apache Arrow project.
				</p>

				<p>
					Datasets are large. Datasets are compressed using Parquet built-in Snappy compression and may be considerably larger when expanded to RAM.
					We expect you to download the dataset, cache the resulting file on a local disk and
					perform your own strategy specific trading pair filtering before using the data. Uncompressed one minute
					candle data takes several gigabyte of memory.
				</p>

				<h2>Learn more</h2>

				<ul>
					<li>
						<a rel="external" href="https://tradingstrategy.ai/docs/programming/examples/getting-started.html">Getting started with Trading Strategy Python client</a>
					</li>
					<li>
						<a rel="external" href="https://tradingstrategy.ai/docs/">Technical documentation</a>
					</li>
					<li>
						<a href="https://github.com/tradingstrategy-ai/client">Github</a>
					</li>
				</ul>

				<h2>Available datasets</h2>

				{#if !validApiKey}
					<form id="form-api-key" class="form-group" on:submit|preventDefault="{handleSubmit}">

						<label for="apiKey">Enter API key to enable download</label>

						<!-- <div class="d-flex flex-row justify-content-center"> -->
						<div id="form-group-api-key">

							<input class="form-control form-group-api-key-item"
								   id="apiKey"
								   placeholder="secret-token:tradingstrategy-"
								   type="text">


							<button type="submit" class="btn btn-primary form-group-api-key-item" disabled={submitting}>Enter</button>

							{#if submitting}
								<Spinner />
							{/if}

						</div>
					</form>
				{/if}

				{#if apiKeyError}
					<div class="alert alert-danger shadow-soft" role="alert">
            			<span class="alert-inner--text">{apiKeyError}</span>
					</div>
				{/if}

				{#if validApiKey}
					<p>
						Using API key <strong>{validApiKey}</strong>
					</p>
				{/if}

				<div class="table-responsive">
					<table class="table table-datasets">
						<thead>
							<tr>
								<th>Name</th>
								<th>Tag</th>
								<th>Entry count (k)</th>
								<th>Size (MBytes)</th>
								<th>Format</th>
								<th>Last updated</th>
								<th>Links</th>
							</tr>
						</thead>

						<tbody>
							{#each datasets as row }
								<tr>
									<td>{row.name}</td>
									<td>{row.designation}</td>
									<td>{formatNumber(row.entries)}</td>
									<td>{formatSize(row.size)}</td>
									<td>{row.format}</td>
									<td>
										<Time relative timestamp="{new Date(row.last_updated_at * 1000)}" />
									</td>

									<td>
										<a class=action-link rel="external" href={row.documentation}>
											Documentation
										</a>

										<a class=action-link rel="external" target="{validApiKey ? `_blank` : undefined}" href="{formatDownloadLink(validApiKey, row.download_link)}" disabled="{validApiKey ? undefined : 'disabled'}">
											Download 
										</a>
									</td>

								</tr>
							{/each}
						</tbody>
					</table>
				</div>

			</div>
		</div>
	</section>
</div>

<style>

	.card-body {
		/* Align text left edge with logo */
		padding: 0;
	}

	.card-body a {
	  	color: var(--link-color);
	  	text-decoration: none;
	  	font-weight: bold;
		transition: 0.3s;
	}

	.card-body a:hover {
	  text-decoration: underline;
	  color: var(--link-color);
	}

	.table-datasets :global(time) {
		white-space: nowrap;
	}

	.action-link {
		font-size: 80%;
		text-transform: uppercase;
	}

	.action-link[disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}

	#form-group-api-key {
		display: flex;
	}

	#form-group-api-key input {
		max-width: 400px;
		margin-right: 20px;
	}

</style>
