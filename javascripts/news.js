document.addEventListener('DOMContentLoaded', () => {
    loadNews();
});

const JSON_URL =
    'https://raw.githubusercontent.com/jeffriechers/RSSjsonfeeds/refs/heads/main/data/news.json';

let rssData = null;

async function loadNews() {

    const loading =
        document.getElementById('rss-news-loading');

    const dashboard =
        document.getElementById('rss-news-dashboard');

    try {

        const response =
            await fetch(JSON_URL);

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        rssData =
            await response.json();

        loading.style.display = 'none';
        dashboard.style.display = 'block';

        renderLayout();
        renderLatestEntries();

    }
    catch (error) {

        loading.innerHTML = `
            <div style="color:red;">
                Failed to load RSS feed data.
                <br>
                ${error.message}
            </div>
        `;

        console.error(error);
    }
}

function renderLayout() {

    const dashboard =
        document.getElementById(
            'rss-news-dashboard'
        );

    let categoryLinks = '';

    categoryLinks += `
        <button class="rss-nav-button"
                onclick="renderLatestEntries()">
            Latest Entries
        </button>
    `;

    categoryLinks += `
        <button class="rss-nav-button"
                onclick="renderAllCategories()">
            All Categories
        </button>
    `;

    for (const [categoryId, categoryData]
        of Object.entries(
            rssData.categories
        )) {

        categoryLinks += `
            <button
                class="rss-nav-button"
                onclick="renderCategory('${categoryId}')">
                ${categoryData.title}
            </button>
        `;
    }

    dashboard.innerHTML = `
        <style>

            .rss-layout {
                display:flex;
                gap:20px;
            }

            .rss-content {
                flex:1;
                min-width:0;
            }

            .rss-sidebar {

                width:250px;

                position:sticky;
                top:80px;

                align-self:flex-start;

                border-left:1px solid #ddd;
                padding-left:20px;
            }

            .rss-nav-button {

                display:block;
                width:100%;

                text-align:left;

                padding:10px;
                margin-bottom:5px;

                border:1px solid #ccc;
                border-radius:4px;

                cursor:pointer;

                background:#f5f5f5;
            }

            .rss-nav-button:hover {
                background:#e0e0e0;
            }

            .rss-card {

                border:1px solid #ddd;
                border-radius:8px;

                padding:15px;
                margin-bottom:15px;
            }

            .rss-card-title {

                font-weight:bold;
                font-size:1.1em;

                margin-bottom:8px;
            }

            .rss-card-meta {

                color:#777;
                font-size:.9em;

                margin-bottom:10px;
            }

            .rss-search {

                width:100%;

                padding:10px;

                margin-bottom:20px;

                border:1px solid #ccc;
                border-radius:5px;
            }

            .rss-footer {

                margin-top:40px;

                border-top:1px solid #ddd;

                padding-top:20px;

                color:#666;
            }

            @media(max-width: 1000px) {

                .rss-layout {
                    flex-direction:column;
                }

                .rss-sidebar {
                    width:100%;
                    border-left:none;
                    padding-left:0;
                }
            }

        </style>

        <div class="rss-layout">

            <div class="rss-content">

                <input
                    id="rss-search"
                    class="rss-search"
                    type="text"
                    placeholder="Search entries..."
                >

                <div id="rss-results"></div>

                <div class="rss-footer"
                     id="rss-footer">
                </div>

            </div>

            <div class="rss-sidebar">

                <h3>Categories</h3>

                ${categoryLinks}

            </div>

        </div>
    `;

    document
        .getElementById('rss-search')
        .addEventListener(
            'input',
            searchEntries
        );

    renderFooter();
}

function renderFooter() {

    const footer =
        document.getElementById(
            'rss-footer'
        );

    footer.innerHTML = `
        <h3>Feed Information</h3>

        <p>
            <strong>Generated:</strong>
            ${new Date(
                rssData.generated
            ).toLocaleString()}
        </p>

        <p>
            <strong>Articles:</strong>
            ${rssData.article_count}
        </p>

        <p>
            <strong>Retention:</strong>
            ${rssData.days_to_keep} days
        </p>
    `;
}

function getAllEntries() {

    const entries = [];

    Object.entries(
        rssData.categories
    ).forEach(([categoryId, category]) => {

        category.items.forEach(item => {

            entries.push({
                ...item,
                categoryId,
                categoryTitle: category.title
            });

        });

    });

    entries.sort((a, b) =>
        new Date(b.published)
        - new Date(a.published)
    );

    return entries;
}

function renderLatestEntries() {

    const entries =
        getAllEntries().slice(0, 25);

    renderEntries(
        'Latest Entries',
        entries
    );
}

function renderAllCategories() {

    const entries =
        getAllEntries();

    renderEntries(
        'All Categories',
        entries
    );
}

function renderCategory(
    categoryId
) {

    const category =
        rssData.categories[
            categoryId
        ];

    const entries =
        category.items.map(item => ({
            ...item,
            categoryTitle:
                category.title
        }));

    renderEntries(
        category.title,
        entries
    );
}

function renderEntries(
    title,
    entries
) {

    const results =
        document.getElementById(
            'rss-results'
        );

    let html = `
        <h2>${title}</h2>
        <p>${entries.length} entries</p>
    `;

    entries.forEach(item => {

        html += `

            <div class="rss-card">

                <div class="rss-card-title">

                    <a href="${item.url}"
                       target="_blank">

                        ${item.title}

                    </a>

                </div>

                <div class="rss-card-meta">

                    ${item.source}
                    |

                    ${new Date(
                        item.published
                    ).toLocaleDateString()}

                    ${item.categoryTitle
                        ? '| ' +
                          item.categoryTitle
                        : ''
                    }

                </div>

            </div>
        `;
    });

    results.innerHTML = html;
}

function searchEntries() {

    const search =
        document
            .getElementById(
                'rss-search'
            )
            .value
            .toLowerCase();

    const entries =
        getAllEntries()
        .filter(item =>

            item.title
                .toLowerCase()
                .includes(search)

            ||

            item.source
                .toLowerCase()
                .includes(search)

            ||

            item.product
                .toLowerCase()
                .includes(search)
        );

    renderEntries(
        `Search Results (${entries.length})`,
        entries
    );
}