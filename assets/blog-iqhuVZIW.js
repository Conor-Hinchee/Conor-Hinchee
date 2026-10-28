import"./js-C2ldAHXV.js";(async()=>{let e=localStorage.getItem(`theme`)||`light`,t=document.getElementById(`blog-post`),n=document.querySelector(`#breadcrumbBlogDropdown ul`),r=document.querySelector(`#breadcrumb-Nav-blog button span.mr-2`);try{let i=await fetch(`/blog/content/posts.json`);if(!i.ok)throw Error(`Failed to fetch posts data`);let a=(await i.json()).posts||[];a.sort((e,t)=>new Date(t.date).getTime()-new Date(e.date).getTime());let o=new URLSearchParams(window.location.search).get(`post`),s,c;if(o&&o!==`latest`&&(s=a.find(e=>e.id===o)),(!s||o===`latest`||!o)&&a.length>0&&(s=a[0]),s?c=s.id:(s={id:`2025-resolution`,title:`Default Post`,date:new Date().toISOString()},c=`2025-resolution`),s.title&&(document.title=`Conor Hinchee | Blog | ${s.title}`),window.dataLayer=window.dataLayer||[],window.dataLayer.push({event:`blog_post_view`,section:void 0,link_url:void 0,link_text:void 0,social_network:void 0,project:void 0,demo:void 0,post_id:c,post_title:s.title}),n){if(n.innerHTML=``,a.length>0)a.forEach(e=>{let t=document.createElement(`li`),r=document.createElement(`a`);r.href=`/blog/?post=${e.id}`,r.className=`block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white`,r.textContent=e.title,t.appendChild(r),n.appendChild(t)});else{let e=document.createElement(`li`);e.innerHTML=`<span class="block px-4 py-2 text-gray-400">No posts available</span>`,n.appendChild(e)}}r&&s.title?r.textContent=`Post: ${s.title}`:r&&(r.textContent=`Post: N/A`),t&&(t.innerHTML=`
        <zero-md src="/blog/content/${c}.md">
          <template>
            <link id="markdown-theme" rel="stylesheet" href="/blog/github-markdown-${e}.css" />
          </template>
        </zero-md>
      `)}catch(i){console.error(`Error loading blog post:`,i),t&&(t.innerHTML=`
        <p class="text-red-500 dark:text-red-400">Error loading post. Displaying default content.</p>
        <zero-md src="/blog/content/2025-resolution.md">
          <template>
            <link id="markdown-theme" rel="stylesheet" href="/blog/github-markdown-${e}.css" />
          </template>
        </zero-md>
      `),r&&(r.textContent=`Post: Error`),n&&(n.innerHTML=`<li><a href="/blog/" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Blog Home (Error)</a></li>`)}})();