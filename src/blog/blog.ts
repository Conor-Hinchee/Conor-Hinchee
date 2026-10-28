// Blog page: loads posts.json, picks the post from ?post=, renders it with
// <zero-md>, fills the breadcrumb dropdown and reports a blog_post_view event.

interface Post {
  id: string;
  title: string;
  date: string;
  content: string;
  tags: string[];
}

interface PostsJson {
  // The original script tolerated a missing list (`data.posts || []`).
  posts?: Post[];
}

// What the page needs to display a post; the error fallback has no content/tags.
type DisplayedPost = Pick<Post, "id" | "title" | "date">;

const initMarkdown = async (): Promise<void> => {
  // Get theme from localStorage, default to 'light' if not set
  const theme = localStorage.getItem("theme") || "light";
  const blogPostContainer = document.getElementById("blog-post");
  // Selectors for breadcrumb elements that will be updated
  const breadcrumbBlogDropdownUL = document.querySelector("#breadcrumbBlogDropdown ul");
  const currentPostButtonSpan = document.querySelector("#breadcrumb-Nav-blog button span.mr-2");

  try {
    // Fetch all posts data from JSON file
    const response = await fetch("/blog/content/posts.json");
    if (!response.ok) {
      throw new Error("Failed to fetch posts data");
    }

    const data = (await response.json()) as PostsJson;
    const allPosts: Post[] = data.posts || []; // Full list of posts, might be empty

    // Sort all posts by date (newest first) for consistent dropdown order and 'latest' logic
    allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const urlParams = new URLSearchParams(window.location.search);
    const requestedPostId = urlParams.get("post"); // Could be an ID, 'latest', or null

    let currentPost: DisplayedPost | undefined; // The post object for the content being displayed (title, ID for MD file)
    let actualPostIdToLoad: string; // The ID of the .md file to load

    if (requestedPostId && requestedPostId !== "latest") {
      // User requested a specific post ID
      currentPost = allPosts.find((p) => p.id === requestedPostId);
      // If specific post not found, currentPost will be undefined here
    }

    // If 'latest' was requested (e.g. /blog/?post=latest),
    // OR if no post ID in URL (requestedPostId is null),
    // OR if a specific post ID was requested but not found (currentPost is undefined from the block above):
    if (!currentPost || requestedPostId === "latest" || !requestedPostId) {
      if (allPosts.length > 0) {
        currentPost = allPosts[0]; // Default to the most recent post
      }
      // If allPosts is empty, currentPost remains undefined here.
    }

    // Fallback if no posts are available OR currentPost is still not determined
    // (e.g., specific ID requested, not found, AND allPosts is empty or was empty from start)
    if (!currentPost) {
      currentPost = { id: "2025-resolution", title: "Default Post", date: new Date().toISOString() };
      actualPostIdToLoad = "2025-resolution"; // The MD file to load for fallback
    } else {
      actualPostIdToLoad = currentPost.id; // The ID of the post to load
    }

    // Update page title based on the determined current post
    if (currentPost.title) {
      document.title = `Conor Hinchee | Blog | ${currentPost.title}`;
    }

    // Analytics: which post was actually read (page_view only shows ?post=latest).
    // Keys mirror EVENT_PARAMS in src/Home/js/analytics.ts so stale values get cleared.
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "blog_post_view",
      section: undefined,
      link_url: undefined,
      link_text: undefined,
      social_network: undefined,
      project: undefined,
      demo: undefined,
      post_id: actualPostIdToLoad,
      post_title: currentPost.title,
    });

    // Populate breadcrumb dropdown with all available posts
    if (breadcrumbBlogDropdownUL) {
      breadcrumbBlogDropdownUL.innerHTML = ""; // Clear any existing static/dynamic items
      if (allPosts.length > 0) {
        allPosts.forEach((p) => {
          const listItem = document.createElement("li");
          const link = document.createElement("a");
          link.href = `/blog/?post=${p.id}`;
          link.className = "block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white";
          link.textContent = p.title; // Assumes p.title exists in posts.json objects
          listItem.appendChild(link);
          breadcrumbBlogDropdownUL.appendChild(listItem);
        });
      } else {
        // If there are no posts, display a message in the dropdown
        const listItem = document.createElement("li");
        listItem.innerHTML = '<span class="block px-4 py-2 text-gray-400">No posts available</span>';
        breadcrumbBlogDropdownUL.appendChild(listItem);
      }
    }

    // Update breadcrumb button text to show the current post's title
    if (currentPostButtonSpan && currentPost.title) {
      currentPostButtonSpan.textContent = `Post: ${currentPost.title}`;
    } else if (currentPostButtonSpan) {
      // Fallback text if title is somehow missing (should be rare with the logic above)
      currentPostButtonSpan.textContent = "Post: N/A";
    }

    // Render the markdown file for the determined post (using actualPostIdToLoad)
    if (blogPostContainer) {
      blogPostContainer.innerHTML = `
        <zero-md src="/blog/content/${actualPostIdToLoad}.md">
          <template>
            <link id="markdown-theme" rel="stylesheet" href="/blog/github-markdown-${theme}.css" />
          </template>
        </zero-md>
      `;
    }
  } catch (error) {
    console.error("Error loading blog post:", error);

    // Fallback to default post display and breadcrumb text on error
    if (blogPostContainer) {
      blogPostContainer.innerHTML = `
        <p class="text-red-500 dark:text-red-400">Error loading post. Displaying default content.</p>
        <zero-md src="/blog/content/2025-resolution.md">
          <template>
            <link id="markdown-theme" rel="stylesheet" href="/blog/github-markdown-${theme}.css" />
          </template>
        </zero-md>
      `;
    }
    if (currentPostButtonSpan) {
      currentPostButtonSpan.textContent = "Post: Error";
    }
    if (breadcrumbBlogDropdownUL) {
      breadcrumbBlogDropdownUL.innerHTML =
        '<li><a href="/blog/" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Blog Home (Error)</a></li>';
    }
  }
};

// Initialize the blog
void initMarkdown();
