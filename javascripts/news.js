async function loadNews() {

    const JSON_URL =
        'https://raw.githubusercontent.com/jeffriechers/RSSjsonfeeds/refs/heads/main/data/news.json';

    try {

        const response = await fetch(JSON_URL);

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data = await response.json();

        const dashboard =
            document.getElementById(
                'rss-news-dashboard'
            );

        const loading =
            document.getElementById(
                'rss-news-loading'
            );

        let html = '';

        html += `
        <div style="
            padding:1rem;
            border:1px solid #ccc;
            border-radius:8px;
            margin-bottom:1rem;
        ">
            <strong>Generated:</strong>
            ${new Date(data.generated).toLocaleString()}
            <br>
            <strong>Articles:</strong>
            ${data.article_count}
            <br>
            <strong>Retention:</strong>
            ${data.days_to_keep} days
        </div>
        `;

        //
        // Latest Releases
        //

        html += '<h2>Latest Releases</h2>';

        html += '<ul>';

        for (const item of data.latest_releases) {

            html += `
            <li>
                <a href="${item.url}" target="_blank">
                    ${item.title}
                </a>
                <br>
                <small>
                    ${item.product}
                    |
                    ${new Date(item.published).toLocaleDateString()}
                </small>
            </li>
            `;
        }

        html += '</ul>';

        //
        // Release Activity
        //

        html += '<h2>Release Activity</h2>';

        html += `
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Releases</th>
                </tr>
            </thead>
            <tbody>
        `;

        for (const item of data.release_activity) {

            html += `
            <tr>
                <td>${item.product}</td>
                <td>${item.count}</td>
            </tr>
            `;
        }

        html += `
            </tbody>
        </table>
        `;

        //
        // Categories
        //

        for (const [categoryId, categoryData]
            of Object.entries(data.categories)) {

            html += `
                <h2>${categoryData.title}</h2>
            `;

            html += `
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Source</th>
                        <th>Title</th>
                    </tr>
                </thead>
                <tbody>
            `;

            for (const item of categoryData.items) {

                html += `
                <tr>
                    <td>
                        ${new Date(
                            item.published
                        ).toLocaleDateString()}
                    </td>

                    <td>
                        ${item.source}
                    </td>

                    <td>
                        <a href="${item.url}"
                           target="_blank">
                           ${item.title}
                        </a>
                    </td>
                </tr>
                `;
            }

            html += `
                </tbody>
            </table>
            `;
        }

        dashboard.innerHTML = html;

        loading.style.display = 'none';
        dashboard.style.display = 'block';

    }
    catch (error) {

        document.getElementById(
            'rss-news-loading'
        ).innerHTML = `
            <div style="color:red;">
                Failed to load RSS data.<br>
                ${error.message}
            </div>
        `;

        console.error(error);
    }
}

document.addEventListener(
    'DOMContentLoaded',
    loadNews
);