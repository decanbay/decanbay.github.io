// Single Page Application Router
const App = (function() {
    const pages = {
        home: `
            <div class="content-box">
                <h1>Recipe for Red Pill</h1>
                <p>Human consciousness and our inner experiences arise from complex biological information processing systems, like computer programs. Much like artificial intelligence, human consciousness does not exist beyond the material or physical realm. Our perception of an autonomous self, free will, and profound inner life is an evolutionary construct, a sophisticated illusion created by neural 'software' following genetic and memetic 'programming'.</p>
                <p>From a cosmic perspective, nothing we think, feel, or experience truly 'matters'; these concepts of meaning, significance, and agency are compelling yet illusory constructs arising from biology, chemistry, and ultimately physics, rather than from any deeper transcendence. This situation presents a paradox: our apparent ability to rationally ponder and 'decide' is undermined by the determinism that precludes true free choices outside the physical truth of cause-and-effect. Even the conclusions questioning free will are themselves deterministic outputs.</p>

                <h2>The Drive to Find Meaning</h2>
                <p>Why do we have this drive to find meaning? It is simply a survival instinct. But why do we want to survive then, in the grand scheme of things, isn't it insignificant? Yes, it is. This drive is simply an undirected consequence of physical laws. Analogous to molecules forming stable conformations, early replicating molecular patterns that persisted and propagated were favoured by these laws, without any inherent intent. They did not 'want' to survive; they just did because of physics, not very different than interacting magnets. Some molecule combinations are more stable, and some combinations of these combinations are even more stable, and so on. The apparent drive towards complexity emerges as a natural consequence of physicochemical systems. This is what creates everything including us. Life is a blind, replicative force shaped by physical forces rather than foresight.</p>
                <p>It is like a virus of physical laws, emerging from the chaos of the universe as certain chemicals and their combinations favour each other. We are a byproduct of the universe's laws. Ultimately, nothing we experience truly 'matters' outside the deterministic chain of physical causality. Emotions, ideals, and perceived choices are appealing ultimately serving to physics without cosmic transcendence.</p>
                <p>Yet, even this revelation is just another domino in the chain of causality, highlighting the harsh reality of our existence, which I find humour and sorrow in its self-deprecation.</p>
                <p>Choosing to live despite knowing this is showing respect to the physics which itself does not but is matter, literally.</p>
            </div>

            <div class="footer">
                Deniz Ekin Canbay
            </div>
        `,
        portfolio: `
            <div class="header">
                <h1>Portfolio</h1>
                <p>My Projects & Work</p>
            </div>
            <div class="project-card" style="text-align:center;">
                <h2>Coming Soon</h2>
                <p>New projects and updates are on the way. Check back soon!</p>
            </div>

            <div class="footer">
                Deniz Ekin Canbay
            </div>
        `
    };

    function navigate(page) {
        const container = document.getElementById('app-container');
        if (!container) return;

        // Update content
        container.innerHTML = pages[page] || pages.home;

        // Update active nav link
        document.querySelectorAll('nav a').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });

        // Update page title
        const titles = {
            home: 'Deniz Ekin Canbay - A Harsh Reality',
            portfolio: 'Deniz Ekin Canbay - Portfolio'
        };
        document.title = titles[page] || titles.home;
    }

    function setupNavigation() {
        // Handle navigation clicks
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                navigate(page);
                // Update URL without reload
                history.pushState({ page }, '', page === 'home' ? '/' : `/${page}`);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || 'home';
            navigate(page);
        });
    }

    function init() {
        // Determine initial page from URL
        const path = window.location.pathname;
        let initialPage = 'home';
        if (path.includes('portfolio')) {
            initialPage = 'portfolio';
        }

        // Set initial state
        history.replaceState({ page: initialPage }, '', path);

        setupNavigation();
        navigate(initialPage);
    }

    return {
        init: init
    };
})();

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', App.init);
} else {
    App.init();
}
