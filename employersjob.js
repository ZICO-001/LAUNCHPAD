const jobs = [
  { title: 'Frontend Intern', posted: 'Posted 2 days ago', applicants: 12, status: 'Active', icon: '<>', tone: 'cool' },
  { title: 'Backend Developer', posted: 'Posted 5 days ago', applicants: 18, status: 'Active', icon: '{ }', tone: 'cool' },
  { title: 'Product Designer', posted: 'Posted 1 week ago', applicants: 7, status: 'Active', icon: 'UI', tone: 'warm' },
  { title: 'UI/UX Designer', posted: 'Posted 2 weeks ago', applicants: 4, status: 'Drafted', icon: 'UX', tone: 'cool' },
  { title: 'DevOps Engineer', posted: 'Posted 2 weeks ago', applicants: 2, status: 'Closed', icon: 'DO', tone: 'warm' },
  { title: 'Mobile App Intern', posted: 'Posted 3 weeks ago', applicants: 11, status: 'Active', icon: 'MB', tone: 'cool' },
  { title: 'Technical Writer', posted: 'Posted 3 weeks ago', applicants: 4, status: 'Drafted', icon: 'TW', tone: 'cool' },
  { title: 'Cloud Support Engineer', posted: 'Posted 3 weeks ago', applicants: 2, status: 'Closed', icon: 'CL', tone: 'warm' },
  { title: 'QA Engineer', posted: 'Posted 3 weeks ago', applicants: 9, status: 'Active', icon: 'QA', tone: 'cool' },
  { title: 'Data Analyst', posted: 'Posted 1 month ago', applicants: 6, status: 'Active', icon: 'DA', tone: 'cool' },
  { title: 'Marketing Lead', posted: 'Posted 1 month ago', applicants: 5, status: 'Closed', icon: 'ML', tone: 'warm' },
  { title: 'Customer Success Rep', posted: 'Posted 1 month ago', applicants: 8, status: 'Active', icon: 'CS', tone: 'cool' },
  { title: 'Content Strategist', posted: 'Posted 2 months ago', applicants: 3, status: 'Closed', icon: 'CT', tone: 'warm' },
  { title: 'Sales Associate', posted: 'Posted 2 months ago', applicants: 10, status: 'Active', icon: 'SA', tone: 'cool' },
  { title: 'Operations Manager', posted: 'Posted 2 months ago', applicants: 1, status: 'Closed', icon: 'OP', tone: 'warm' },
];

const jobsList = document.getElementById('jobs-list');
const resultsSummary = document.getElementById('results-summary');
const tabs = document.querySelectorAll('.tab');
const searchInput = document.getElementById('search-input');
let currentFilter = 'all';

function getFilteredJobs() {
  const query = searchInput.value.trim().toLowerCase();
  return jobs.filter((job) => {
    const matchesStatus = currentFilter === 'all' || job.status === currentFilter;
    const matchesSearch = !query || `${job.title} ${job.status}`.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });
}

function updateSummary(visibleCount, totalCount) {
  if (!totalCount) {
    resultsSummary.textContent = 'Showing 0 jobs';
    return;
  }

  resultsSummary.textContent = `Showing 1 to ${visibleCount} of ${totalCount} jobs`;
}

function renderJobs() {
  const filteredJobs = getFilteredJobs();
  const visibleJobs = filteredJobs.slice(0, 8);

  if (!visibleJobs.length) {
    jobsList.innerHTML = '<p class="empty-state">No jobs match this section.</p>';
  } else {
    jobsList.innerHTML = visibleJobs
      .map(
        (job) => `
          <article class="job-row table-grid">
            <div class="job-main">
              <span class="job-icon ${job.tone === 'warm' ? 'warm' : ''}">${job.icon}</span>
              <div>
                <strong class="job-title">${job.title}</strong>
                <span class="job-date">${job.posted}</span>
              </div>
            </div>
            <span class="candidates">${job.applicants} Candidates</span>
            <span class="badge ${job.status}">${job.status}</span>
            <button class="actions" type="button" aria-label="More actions for ${job.title}">⋯</button>
          </article>
        `
      )
      .join('');
  }

  updateSummary(visibleJobs.length, filteredJobs.length);
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((item) => item.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    renderJobs();
  });
});

searchInput.addEventListener('input', renderJobs);
renderJobs();
