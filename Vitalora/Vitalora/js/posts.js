document.addEventListener('DOMContentLoaded', () => {
    const postsContainer = document.getElementById('posts-feed');
    const createPostSection = document.getElementById('create-post-section');
    const guestPrompt = document.getElementById('guest-prompt');
    const postContentInput = document.getElementById('post-content');
    const submitPostBtn = document.getElementById('submit-post');
    const authItem = document.getElementById('auth-item');

    // Simulated User Data (would come from login)
    const currentUser = JSON.parse(localStorage.getItem('vitalora_user'));

    // Initialize Posts if empty
    if (!localStorage.getItem('vitalora_posts')) {
        const initialPosts = [
            {
                id: 1,
                author: "Dr. Sarah Chen",
                role: "Virologist",
                content: "Noticing a 15% uptick in respiratory cases in Sector 7. The pattern doesn't match seasonal flu. Anyone else seeing this?",
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                likes: 12
            },
            {
                id: 2,
                author: "Admin System",
                role: "System",
                content: "ALERT: New viral threshold parameters have been deployed to the Pattern Recognition AI. Please review the updated documentation.",
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                likes: 45
            }
        ];
        localStorage.setItem('vitalora_posts', JSON.stringify(initialPosts));
    }

    // Auth State Handling
    if (currentUser) {
        createPostSection.classList.add('active');
        guestPrompt.style.display = 'none';
        
        // Update Navbar to show Logout (Optional but good UX)
        authItem.innerHTML = `<a href="#" id="logout-btn" class="nav-link">Logout (${currentUser.name})</a>`;
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('vitalora_user');
            window.location.reload();
        });
    } else {
        createPostSection.style.display = 'none';
        guestPrompt.classList.add('active');
    }

    // Render Posts
    function renderPosts() {
        const posts = JSON.parse(localStorage.getItem('vitalora_posts')) || [];
        // Sort by newest first
        posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        postsContainer.innerHTML = '';

        posts.forEach(post => {
            const isOwner = currentUser && post.author === currentUser.name;
            const card = document.createElement('div');
            card.className = 'post-card animate';
            
            const date = new Date(post.timestamp).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            card.innerHTML = `
                <div class="post-header">
                    <div class="post-author">
                        <div class="author-avatar">${post.author.charAt(0)}</div>
                        <div class="author-info">
                            <h4>${post.author}</h4>
                            <span style="font-size: 0.8rem; color: var(--primary);">${post.role || 'Member'}</span>
                        </div>
                    </div>
                    <div class="post-time">${date}</div>
                </div>
                <div class="post-content" id="content-${post.id}">${escapeHtml(post.content)}</div>
                <div class="post-footer">
                    <div class="post-likes">
                        <span>❤️</span> ${post.likes}
                    </div>
                    ${isOwner ? `<button class="edit-btn" onclick="editPost(${post.id})">Edit</button>` : ''}
                </div>
            `;
            postsContainer.appendChild(card);
        });
    }

    // Helper to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Create New Post
    submitPostBtn.addEventListener('click', () => {
        const content = postContentInput.value.trim();
        if (!content) return;

        const newPost = {
            id: Date.now(),
            author: currentUser.name,
            role: currentUser.role || "Doctor", // Simplified for now
            content: content,
            timestamp: new Date().toISOString(),
            likes: 0
        };

        const posts = JSON.parse(localStorage.getItem('vitalora_posts')) || [];
        posts.push(newPost);
        localStorage.setItem('vitalora_posts', JSON.stringify(posts));
        
        postContentInput.value = '';
        renderPosts();
    });

    // Make editPost globally available
    window.editPost = function(id) {
        const posts = JSON.parse(localStorage.getItem('vitalora_posts'));
        const post = posts.find(p => p.id === id);
        if (!post) return;

        // Prompt for new content (Simple implementation)
        // ideally this would switch the UI to a textarea in-place
        const newContent = prompt("Edit your post:", post.content);
        
        if (newContent !== null && newContent.trim() !== "") {
            post.content = newContent.trim();
            localStorage.setItem('vitalora_posts', JSON.stringify(posts));
            renderPosts();
        }
    };

    renderPosts();
});
