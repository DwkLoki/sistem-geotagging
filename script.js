document.getElementById('importButton').addEventListener('click', () => {
    let fileInput = document.getElementById('excelFile');
    let file = fileInput.files[0];

    if (file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            let data = new Uint8Array(e.target.result);
            let workbook = XLSX.read(data, { type: 'array' });

            let firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            let jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            // console.log(jsonData);

            displayData(jsonData);
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert('Please select a file first.');
    }
});

const itemsPerPage = 10;
let currentPage = 1;
let paginatedData = [];
let maxPageLinks = getMaxPageLinks();

function getMaxPageLinks() {
    if (window.matchMedia("(min-width: 320px) and (max-width: 767px)").matches) {
        return 3; // Misalnya kita menampilkan maksimal 3 tautan halaman pada perangkat kecil
    } else {
        return 5; // Default nilai untuk perangkat yang lebih besar
    }
}

window.addEventListener('resize', () => {
    maxPageLinks = getMaxPageLinks();
    setupPagination(paginatedData.length); // Perbarui pagination saat ukuran layar berubah
});

function displayData(data) {
    paginatedData = data.slice(1).map(item => ({
        ...item,
        used: false // Tambahkan properti used dengan nilai awal false untuk setiap item
    })); 
    showPage(1);
    setupPagination(paginatedData.length);
}

function showPage(page) {
    currentPage = page;
    let start = (currentPage - 1) * itemsPerPage;
    let end = start + itemsPerPage;
    let pageData = paginatedData.slice(start, end);

    let accordion = document.getElementById('accordionFlushExample');
    accordion.innerHTML = '';

    pageData.forEach((row, index) => {
        let itemId = `flush-collapse${start + index}`;
        let headerId = `heading${start + index}`;

        let item = `
            <div class="accordion-item ${row.used ? 'used' : ''}">
                <h2 class="accordion-header" id="${headerId}">
                    <button class="accordion-button collapsed ${row.used ? 'used' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#${itemId}" aria-expanded="false" aria-controls="${itemId}">
                        ${row[2]} <!-- Alamat -->
                    </button>
                </h2>
                <div id="${itemId}" class="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                    <div class="accordion-body">
                        <p>Nama: ${row[1]}</p>
                        <p>Alamat: ${row[2]}</p>
                        <p>Kelurahan: ${row[3]}</p>
                        <p>No Voucher: ${row[4]}</p>
                        <button class="btn btn-success" ${row.used ? 'disabled' : ''} onclick="markAsUsed(${start + index})">
                            ${row.used ? 'Marked as Used' : 'Mark as Used'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        accordion.innerHTML += item;
    });

    setupPagination(paginatedData.length); // Update pagination when the page changes
}

function setupPagination(totalItems) {
    let pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    let totalPages = Math.ceil(totalItems / itemsPerPage);

    let startPage = Math.max(1, currentPage - Math.floor(maxPageLinks / 2));
    let endPage = Math.min(totalPages, currentPage + Math.floor(maxPageLinks / 2));

    if (currentPage - Math.floor(maxPageLinks / 2) < 1) {
        endPage = Math.min(totalPages, endPage + (1 - (currentPage - Math.floor(maxPageLinks / 2))));
    }

    if (currentPage + Math.floor(maxPageLinks / 2) > totalPages) {
        startPage = Math.max(1, startPage - ((currentPage + Math.floor(maxPageLinks / 2)) - totalPages));
    }

    let prevItem = document.createElement('li');
    prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    let prevLink = document.createElement('button');
    prevLink.className = 'page-link';
    prevLink.textContent = 'Previous';
    prevLink.addEventListener('click', () => showPage(currentPage - 1));
    prevItem.appendChild(prevLink);
    pagination.appendChild(prevItem);

    for (let i = startPage; i <= endPage; i++) {
        let pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        
        let pageLink = document.createElement('button');
        pageLink.className = 'page-link';
        pageLink.textContent = i;
        pageLink.addEventListener('click', () => showPage(i));
        
        pageItem.appendChild(pageLink);
        pagination.appendChild(pageItem);
    }

    let nextItem = document.createElement('li');
    nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    let nextLink = document.createElement('button');
    nextLink.className = 'page-link';
    nextLink.textContent = 'Next';
    nextLink.addEventListener('click', () => showPage(currentPage + 1));
    nextItem.appendChild(nextLink);
    pagination.appendChild(nextItem);
}

// function markAsUsed(index) {
//     paginatedData[index].used = true;
//     showPage(currentPage); // Refresh current page to show updates
// }

function markAsUsed(index) {
    paginatedData[index].used = true;
    
    // Update DOM directly to reflect the change without reloading the entire page
    let itemId = `flush-collapse${index}`;
    let headerId = `heading${index}`;
    let accordionItem = document.getElementById(itemId);
    let accordionHeader = document.getElementById(headerId);

    if (accordionItem, accordionHeader) {
        accordionItem.classList.add('used'); // Tambahkan kelas used pada accordion-item yang sesuai
        accordionHeader.classList.add('used'); // Tambahkan kelas used pada accordion-header yang sesuai
        
        let collapseBody = accordionItem.querySelector('.accordion-body');
        if (collapseBody) {
            let markButton = collapseBody.querySelector('.btn-success');
            if (markButton) {
                markButton.textContent = 'Marked as Used';
                markButton.disabled = true; // Optional: disable the button after marking as used
            }
        }
    }
}