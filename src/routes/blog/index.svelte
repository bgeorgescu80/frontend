<script context="module">
  // Ghost client
  import { fetchBlogroll } from "$lib/blog/feed";

  // TODO: Mobile menu requires hydrate
  // Pure server-side rendered page - no interactive JS
  export const hydrate = true;

  export async function load({ fetch }) {
    return {
      props: {
        posts: await fetchBlogroll(25)
      }
    }
  }
</script>

<script>
  import Time from "svelte-time";
  import Sidebar from "$lib/blog/Sidebar.svelte";

  export let posts = [];
</script>

<svelte:head>
    <title>Blog</title>
    <meta name="description" content="Latest on algorithmic trading">
</svelte:head>


<div class="container">

  <div class="section-blog-roll">
    <div class="row">
      <div class="col-md-12">
        <h1>Trading Strategy blog</h1>

        <p class="lead">
          Follow our decentralised algorithmic trading protocol development.
        </p>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-9 col-md-12">
        {#each posts as post}

          <div class="card bg-primary border-light shadow-soft card-post">

            {#if post.feature_image}
              <a href={`/blog/${post.slug}`}>
                <img class="card-img-top rounded-top" src={post.feature_image} alt={post.feature_image_alt}>
              </a>
            {/if}

            <div class="card-body">

              <h5 class="card-title">
                <a href={`/blog/${post.slug}`}>
                  {post.title}
                </a>
              </h5>

              <p class="text-published text-muted text-sm">
                {new Date(post.published_at).toDateString()} Published: <Time relative timestamp="{Date.parse(post.published_at)}" />
              </p>

              <p class="card-text">
                {post.excerpt}
              </p>

              <a class="btn btn-primary btn-sm btn-read" href={`/blog/${post.slug}`}>Read post</a>
            </div>

          </div>
        {:else}
          <p>
            No blog posts found (check if Ghost is properly configured)
          </p>
        {/each}
      </div>

      <div class="col-lg-3 col-md-12">
        <Sidebar />
      </div>
    </div>
  </div>
</div>

<style>

  .section-blog-roll {
    margin: 60px 0;
  }

  .card {
      margin-bottom: 60px;
  }

  .card-img-top {
    max-height: 220px;
    object-fit: cover;
  }

  .text-published {
    font-size: 70%;
    text-transform: uppercase;
  }

  .btn-read {
    float: right;
  }
</style>
