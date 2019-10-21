function makeBookmarksArray() {
    return [
        {
            id: 1,
            title: 'Bookmark 1',
            url: 'https://www.websiteone.com',
            description: 'Natus consequuntur deserunt',
            rating: 2
        },
        {
            id: 2,
            title: 'Bookmark 2',
            url: 'https://www.websitetwo.com',
            description: 'Cum, exercitationem cupiditate',
            rating: 5
        },
        {
            id: 3,
            title: 'Bookmark 3',
            url: 'https://www.websitethree.com',
            description: 'Possimus, voluptate?',
            rating: 4
        },
    ];
};

function makeMaliciousBookmark() {
    return {
        id: 911,
        title: 'Malicious Test Bookmark <script>alert("xss");</script>',
        url: 'https://www.bad.com',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        rating: 5
    };
};

function makeSantizedBookmark() {
    return {
        id: 911,
        title: 'Malicious Test Bookmark &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        url: 'https://www.bad.com',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
        rating: 5
    }
}

module.exports = {
    makeBookmarksArray,
    makeMaliciousBookmark,
    makeSantizedBookmark
};