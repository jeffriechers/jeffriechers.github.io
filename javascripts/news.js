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

    let categoryButtons = '';

    categoryButtons += `
        <button class="rss-filter active"
                onclick="setActiveButton(this); renderLatestEntries();">
            Latest
        </button>
    `;

    categoryButtons += `
        <button class="rss-filter"
                onclick="setActiveButton(this); renderAllCategories();">
            All
        </button>
    `;

    for (const [categoryId, categoryData]
        of Object.entries(rssData.categories)) {

        categoryButtons += `
            <button
                class="rss-filter"
                onclick="setActiveButton(this); renderCategory('${categoryId}')">
                ${categoryData.title}
            </button>
        `;
    }

    dashboard.innerHTML = `
        <style>

            .rss-toolbar {

                margin-bottom:20px;
            }

            .rss-search {

                width:100%;

                padding:12px;

                border-radius:5px;

                margin-bottom:15px;

                border:1px solid var(--md-default-fg-color--lightest);
            }

            .rss-filter-bar {

                display:flex;
                flex-wrap:wrap;
                gap:10px;

                margin-bottom:25px;
            }

            .rss-filter {

                border:none;

                padding:8px 16px;

                border-radius:20px;

                cursor:pointer;

                background:#e0e0e0;
            }

            .rss-filter.active {

                background:#1976d2;
                color:white;
            }

            .rss-results {

                display:grid;

                grid-template-columns:
                    repeat(
                        auto-fill,
                        minmax(350px,1fr)
                    );

                gap:15px;
            }

            .rss-card {

                border:1px solid #ddd;

                border-radius:8px;

                padding:15px;

                height:100%;
            }

            .rss-card-title {

                font-size:1.15em;

                font-weight:600;

                margin-bottom:10px;
            }

            .rss-card-title a {

                text-decoration:none;
            }

            .rss-card-source {

                color:#777;

                font-size:.9em;

                margin-top:10px;
            }

            .rss-footer {

                margin-top:40px;

                padding-top:20px;

                border-top:1px solid #ddd;
            }

        </style>

        <div class="rss-toolbar">

            <input
                id="rss-search"
                class="rss-search"
                type="text"
                placeholder="Search articles..."
            >

            <div class="rss-filter-bar">
                ${categoryButtons}
            </div>

        </div>

        <div id="rss-results"
             class="rss-results">
        </div>

        <div id="rss-footer"
             class="rss-footer">
        </div>
    `;

    document
        .getElementById(
            'rss-search'
        )
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
function setActiveButton(btn) {

    document
        .querySelectorAll('.rss-filter')
        .forEach(x =>
            x.classList.remove(
                'active'
            )
        );

    btn.classList.add(
        'active'
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

    let html = '';

    entries.forEach(item => {

        html += `
            <div class="rss-card">

                <div class="rss-card-title">

                    <a href="${item.url}"
                       target="_blank">

                        ${item.title}

                    </a>

                </div>

                <div>

                    ${item.categoryTitle || ''}

                </div>

                <div class="rss-card-source">

                    ${item.source}
                    <br>

                    ${new Date(
                        item.published
                    ).toLocaleDateString()}

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