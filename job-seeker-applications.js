
const initialApplications = [
  // Replace objects in the array with the api link gotten from the backend developers
  { id: 1, title: 'Frontend Developer Intern', company: 'Paystack', placement: 'Remote', location: 'Lagos', appliedTime: 'Applied 2 days ago', status: 'under-review', initial: 'P', logoClass: 'logo-p' },
  { id: 2, title: 'UI/UX Design Intern', company: 'Paystack', placement: 'Hybrid', location: 'Lagos', appliedTime: 'Applied 5 days ago', status: 'interview', initial: 'T', logoClass: 'logo-t' },
  { id: 3, title: 'UI/UX Design Intern', company: 'Paystack', placement: 'Hybrid', location: 'Lagos', appliedTime: 'Applied 5 days ago', status: 'under-review', initial: 'S', logoClass: 'logo-s' },
  { id: 4, title: 'Backend Developer Intern', company: 'Fullstack Dan', placement: 'Lagos', location: 'Nigeria', appliedTime: 'Applied 1 week ago', status: 'under-review', initial: 'T', logoClass: 'logo-t' },
  { id: 5, title: 'Backend Developer Intern', company: 'Saler', placement: 'Lagos', location: 'Nigeria', appliedTime: 'Applied 1 week ago', status: 'under-review', initial: 'T', logoClass: 'logo-t' },
  { id: 6, title: 'Backend Developer Intern', company: 'Saler', placement: 'Lagos', location: 'Nigeria', appliedTime: 'Applied 1 week ago', status: 'under-review', initial: 'T', logoClass: 'logo-t' }
];

let currentFilter = 'all';
let searchQuery = '';

const container = document.getElementById('applicationsContainer');
const searchInput = document.getElementById('jobSearch');
const tabButtons = document.querySelectorAll('.tab-button');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');

function initApp() {
  updateStatusCounts();
  renderApplications();
  setupEventListeners();
}

function updateStatusCounts() {
  const counts = { all: initialApplications.length, 'under-review': 0, interview: 0, offered: 0, rejected: 0 };
  
  initialApplications.forEach(app => {
    if (counts[app.status] !== undefined) counts[app.status]++;
  });

  document.getElementById('count-all').textContent = counts.all;
  document.getElementById('count-review').textContent = counts['under-review'];
  document.getElementById('count-interview').textContent = counts.interview;
  document.getElementById('count-offered').textContent = counts.offered;
  document.getElementById('count-rejected').textContent = counts.rejected;
}

function renderApplications() {
  // Filter Array based on Tab state and Input text query matches
  const filtered = initialApplications.filter(app => {
    const matchesTab = (currentFilter === 'all' || app.status === currentFilter);
    const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  container.innerHTML = '';

  if (filtered.length === 0) {
    renderEmptyState();
    return;
  }

  filtered.forEach(app => {
    const card = document.createElement('div');
    card.className = 'job-card';
    
    const displayStatus = app.status === 'under-review' ? 'Under Review' : 'Interview';
    const badgeClass = app.status;
    const iconName = app.status === 'under-review' ? 'schedule' : 'calendar_today';

    card.innerHTML = `
      <div class="job-details-wrapper">
        <div class="company-logo-placeholder ${app.logoClass}">${app.initial}</div>
        <div class="job-text-info">
          <h4>${app.title}</h4>
          <div class="job-meta-tags">
            <span>${app.company}</span>
            <span class="dot-separator">&bull;</span>
            <span>${app.placement}</span>
            <span class="dot-separator">&bull;</span>
            <span>${app.location}</span>
            <span class="dot-separator">&bull;</span>
            <span>${app.appliedTime}</span>
          </div>
        </div>
      </div>
      <div class="status-badge ${badgeClass}">
        <span class="material-symbols-outlined badge-dot">${iconName}</span>
        <span>${displayStatus}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderEmptyState() {
  let titleText = "You haven't been offered any job yet.";
  if (currentFilter === 'rejected') {
    titleText = "You have no rejected application.";
  } else if (searchQuery !== '') {
    titleText = "No results match your search parameters.";
  }

  container.innerHTML = `
    <div class="empty-state">
      <h3>${titleText}</h3>
      <p>Browse Jobs to see roles you can apply for</p>
      <a href="#" class="browse-gigs-btn">
        <span class="material-symbols-outlined">search</span>
        <span>Browse Jobs</span>
      </a>
    </div>
  `;
}

function setupEventListeners() {
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderApplications();
  });

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      currentFilter = button.getAttribute('data-status');
      renderApplications();
    });
  });

  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('mobile-open');
  });

  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('mobile-open') && !sidebar.contains(e.target) && e.target !== menuToggle) {
      sidebar.classList.remove('mobile-open');
    }
  });
}

document.addEventListener('DOMContentLoaded', initApp);