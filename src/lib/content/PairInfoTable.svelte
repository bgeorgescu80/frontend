<script>


    import { formatDollar } from '$lib/helpers/formatters';
    import { formatPriceChange } from '$lib/helpers/formatters';


    export let summary;
    export let details;

    /**
     * Reverse-calculate raw price using the US/quota token exchange rate
     */
    function calculateTokenPrice() {
        if(!summary.exchange_rate) {
            return null;
        }

        const tokenPrice = summary.usd_price_latest / summary.exchange_rate;
        return tokenPrice;
    }

    let tokenPrice = calculateTokenPrice();

    $: priceChangeColorClass = summary.price_change_24h >= 0 ? "price-change-green" : "price-change-red";
</script>

<table class="table">
    <tr>
        <th>Token</th>
        <td>{summary.base_token_symbol_friendly}</td>
    </tr>

    <tr>
        <th>Quoted in</th>
        <td>{summary.quote_token_symbol_friendly}</td>
    </tr>
    <tr>
        <th>Price</th>
        <td>
            <strong class="{priceChangeColorClass}">
                { formatDollar(summary.usd_price_latest, 3, 3, "") } USD
            </strong>
        </td>
    </tr>

    {#if tokenPrice}
        <tr>
            <th>Token price</th>
            <td>
                <strong class="{priceChangeColorClass}">
                    { formatDollar(tokenPrice, 3, 3, "") } {summary.quote_token_symbol_friendly}
                </strong>
            </td>
        </tr>
    {/if}

    <tr>
        <th>Change 24h</th>
        <td>
            <strong class="{priceChangeColorClass}">
                { formatPriceChange(summary.price_change_24h) }
            </strong>
        </td>
    </tr>

    <tr>
        <th>Volume 24h</th>
        <td>
            {formatDollar(summary.usd_volume_24h)}
        </td>
    </tr>

    <tr>
        <th>Liquidity</th>
        <td>
            {formatDollar(summary.usd_liquidity_latest)}
        </td>
    </tr>

    {#if summary.exchange_rate }
        <tr>
            <th>Dollar exchange rate</th>
            <td>
                { formatDollar(summary.exchange_rate, 3, 3, "") } USD / {summary.quote_token_symbol_friendly}
            </td>
        </tr>
    {/if}

    <tr>
        <th>Trading pair</th>
        <td>{summary.pair_symbol}</td>
    </tr>

    <tr>
        <th>Exchange</th>
        <td>
            <a href="/trading-view/{summary.chain_slug}/{summary.exchange_slug}">{details.exchange_name}</a>
        </td>
    </tr>

    <tr>
        <th>Blockchain</th>
        <td>
            <a href="/trading-view/{summary.chain_slug}">{details.chain_name}</a>
        </td>
    </tr>

    <tr>
        <th>Internal id</th>
        <td>
            {summary.pair_id}
        </td>
    </tr>
</table>

<style>

    table {
        font-size: 1rem;
    }

    table td, table th {
        padding: 0.25rem;
        border: 0;
    }

    /* --breakpoint-md */
    @media(max-width: 992px) {
        /* On mobile, don't render headings too wide */
        table th, table td {
            border-bottom: 1px solid #ccbeb3;
        }
    }

    a {
        border-bottom: 1px solid var(--link-underline);
    }

    a:hover {
        color: var(--link-underline);
    }

</style>