document.addEventListener('DOMContentLoaded', () => {
    loadNews();
});

const JSON_URL =
    'https://raw.githubusercontent.com/jeffriechers/RSSjsonfeeds/refs/heads/main/data/news.json';

let rssData = null;
let activeCategory = null;
let activeVendor = null;

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
function renderVendorFilters(categoryId) {

    const vendorBar =
        document.getElementById(
            'rss-vendor-bar'
        );

    const vendors =
        new Set();

    rssData.categories[
        categoryId
    ].items.forEach(item => {

        if (
            item.vendor
        ) {
            vendors.add(
                item.vendor
            );
        }

    });

    let html = '';

    html += `
        <button
            class="rss-filter active"
            onclick="
                activeVendor=null;
                renderCategory(
                    '${categoryId}'
                )
            ">
            All Vendors
        </button>
    `;

    [...vendors]
        .sort()
        .forEach(vendor => {

            html += `
                <button
                    class="rss-filter"
                    onclick="
                        activeVendor='${vendor}';
                        renderCategory(
                            '${categoryId}'
                        )
                    ">
                    ${vendor}
                </button>
            `;

        });

    vendorBar.innerHTML =
        html;
}
function renderLayout() {

    const dashboard =
        document.getElementById(
            'rss-news-dashboard'
        );

    let categoryButtons = '';

    categoryButtons += `
        <button
            class="rss-filter active"
            onclick="
                setActiveButton(this);
                activeCategory = null;
                activeVendor = null;
                clearVendorBar();
                renderLatestEntries();
            ">
            Latest
        </button>
    `;

    categoryButtons += `
        <button
            class="rss-filter"
            onclick="
                setActiveButton(this);
                activeCategory = null;
                activeVendor = null;
                clearVendorBar();
                renderAllCategories();
            ">
            All
        </button>
    `;

    for (
        const [
            categoryId,
            categoryData
        ]
        of Object.entries(
            rssData.categories
        )
    ) {

        categoryButtons += `
            <button
                class="rss-filter"
                onclick="
                    setActiveButton(this);
                    renderCategory('${categoryId}');
                ">
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

    border:1px solid var(
        --md-default-fg-color--lightest
    );
}

.rss-filter-bar {

    display:flex;

    flex-wrap:wrap;

    gap:10px;

    margin-bottom:15px;
}

.rss-filter {

    border:none;

    padding:8px 16px;

    border-radius:20px;

    cursor:pointer;

    background:#e0e0e0;

    transition:.15s;
}

.rss-filter.active {

    background:#1976d2;

    color:white;
}

.rss-results {

    display:flex;

    flex-direction:column;

    gap:12px;
}

.rss-card {

    border:1px solid #ddd;

    border-radius:8px;

    padding:15px 20px;

    width:100%;
}

.rss-card-title {

    font-size:1.15em;

    font-weight:600;

    margin-bottom:10px;
}

.rss-card-title a {

    text-decoration:none;
}

.rss-card-meta {

    display:flex;

    flex-wrap:wrap;

    gap:6px;

    margin-bottom:10px;
}

.rss-badge {

    display:inline-block;

    padding:4px 8px;

    border-radius:12px;

    font-size:.75em;

    font-weight:600;

    background:#eceff1;
}

.rss-badge-vendor {

    background:#1565c0;

    color:white;
}

.rss-badge-product {

    background:#455a64;

    color:white;
}

.rss-badge-critical {

    background:#b71c1c;

    color:white;
}

.rss-badge-high {

    background:#ef6c00;

    color:white;
}

.rss-badge-medium {

    background:#f9a825;

    color:black;
}

.rss-badge-low {

    background:#2e7d32;

    color:white;
}

.rss-card-summary {

    margin-top:10px;

    font-size:.95em;

    overflow:hidden;

    display:-webkit-box;

    -webkit-line-clamp:4;

    -webkit-box-orient:vertical;
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

    <div
        id="rss-vendor-bar"
        class="rss-filter-bar">
    </div>

</div>

<div
    id="rss-results"
    class="rss-results">
</div>

<div
     id="rss-footer"
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
function clearVendorBar() {

    const vendorBar =
        document.getElementById(
            'rss-vendor-bar'
        );

    if (vendorBar) {

        vendorBar.innerHTML = '';
    }
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

function renderCategory(categoryId) {

    activeCategory = categoryId;

    const category =
        rssData.categories[
            categoryId
        ];

    //
    // Build vendor list
    //

    const vendors =
        [
            ...new Set(
                category.items
                    .map(
                        item =>
                            item.vendor
                    )
                    .filter(
                        v =>
                            v &&
                            v.length > 0
                    )
            )
        ]
        .sort();

    const vendorBar =
        document.getElementById(
            'rss-vendor-bar'
        );

    let vendorHtml = '';

    vendorHtml += `
        <button
            class="rss-filter ${
                !activeVendor
                    ? 'active'
                    : ''
            }"
            onclick="
                activeVendor = null;
                renderCategory('${categoryId}');
            ">
            All Vendors
        </button>
    `;

    vendors.forEach(vendor => {

        vendorHtml += `
            <button
                class="rss-filter ${
                    activeVendor === vendor
                        ? 'active'
                        : ''
                }"
                onclick="
                    activeVendor = '${vendor}';
                    renderCategory('${categoryId}');
                ">
                ${vendor}
            </button>
        `;
    });

    vendorBar.innerHTML =
        vendorHtml;

    //
    // Apply vendor filter
    //

    let entries =
        category.items;

    if (
        activeVendor
    ) {

        entries =
            entries.filter(
                item =>
                    item.vendor ===
                    activeVendor
            );
    }

    //
    // Add category title
    //

    entries =
        entries.map(
            item => ({
                ...item,
                categoryTitle:
                    category.title
            })
        );

    renderEntries(
        activeVendor
            ? `${category.title} - ${activeVendor}`
            : category.title,
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

        <div class="rss-card-meta">

            ${
                item.vendor
                ?
                `<span class="rss-badge rss-badge-vendor">
                    ${item.vendor}
                 </span>`
                :
                ''
            }

            ${
                item.product
                ?
                `<span class="rss-badge rss-badge-product">
                    ${item.product}
                 </span>`
                :
                ''
            }

            ${
                item.severity
                ?
                `<span class="rss-badge rss-badge-${
                    item.severity.toLowerCase()
                }">
                    ${item.severity}
                 </span>`
                :
                ''
            }

            ${
                item.cvss
                ?
                `<span class="rss-badge">
                    CVSS ${item.cvss}
                 </span>`
                :
                ''
            }

            ${
                item.cve
                ?
                `<span class="rss-badge">
                    ${item.cve}
                 </span>`
                :
                ''
            }

        </div>

        <div class="rss-card-title">

            <a href="${item.url}"
               target="_blank">

                ${item.title}

            </a>

        </div>

        ${
            item.summary
            ?
            `
            <div class="rss-card-summary">
                ${item.summary}
            </div>
            `
            :
            ''
        }

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