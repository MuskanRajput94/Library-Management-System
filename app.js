const DUE_DAYS = 7;
const FINE_PER_DAY = 5;
const ADMIN_EMAIL = 'Muskan_admin@gmail.com';
const ADMIN_PASS = 'Muskan@123';

/* Auth */

function checkAuth() {
    if (sessionStorage.getItem('loggedIn') === 'true') showApp();
}

function showApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    loadBooks();
    loadMembers();
    loadTransactions();
    loadStats();
}

function logout() {
    sessionStorage.removeItem('loggedIn');
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('login-form').reset();
    document.getElementById('login-error').textContent = '';
}

document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && pass === ADMIN_PASS) {
        sessionStorage.setItem('loggedIn', 'true');
        showApp();
    } else {
        document.getElementById('login-error').textContent = 'Invalid email or password.';
    }
});

/* Toast */

function toast(msg, type = 'success') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast show ' + type;
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.className = 'toast', 3000);
}

/* Modals */

function openModal(id) {
    document.getElementById(id).classList.add('open');
    if (id === 'issue-modal') populateIssueDropdowns();
    if (id === 'return-modal') populateReturnDropdown();
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
});

/* Tabs */

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

/* Date utils */

function daysBetween(d1, d2) {
    return Math.floor((new Date(d2) - new Date(d1)) / 86400000);
}

function addDays(dateStr, n) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
}

function today() {
    return new Date().toISOString().split('T')[0];
}

/* Dashboard */

async function loadStats() {
    const { count: bookCount } = await db.from('books').select('id', { count: 'exact', head: true });
    const { count: memberCount } = await db.from('members').select('id', { count: 'exact', head: true });
    const { data: active } = await db.from('transactions').select('id, issue_date').is('return_date', null);

    let overdueCount = 0;
    const now = today();
    if (active) {
        active.forEach(t => {
            if (now > addDays(t.issue_date, DUE_DAYS)) overdueCount++;
        });
    }

    document.getElementById('stat-books').textContent = bookCount || 0;
    document.getElementById('stat-members').textContent = memberCount || 0;
    document.getElementById('stat-issued').textContent = active ? active.length : 0;
    document.getElementById('stat-overdue').textContent = overdueCount;
}

/* Books */

async function loadBooks(filter = '') {
    let query = db.from('books').select('*').order('id');
    if (filter) {
        query = db.from('books').select('*')
            .or(`title.ilike.%${filter}%,author.ilike.%${filter}%`)
            .order('id');
    }

    const { data: books, error } = await query;
    if (error) { toast(error.message, 'error'); return; }

    const tbody = document.querySelector('#books-table tbody');
    const emptyMsg = document.getElementById('books-empty');

    if (!books.length) {
        tbody.innerHTML = '';
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';
    tbody.innerHTML = books.map(b => `
        <tr>
            <td>${b.id}</td>
            <td>${b.title}</td>
            <td>${b.author}</td>
            <td>${b.quantity}</td>
            <td>${b.available}</td>
            <td class="actions-cell">
                <button class="btn btn-primary btn-sm" onclick="editBook(${b.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteBook(${b.id}, '${b.title.replace(/'/g, "\\'")}')" >Del</button>
            </td>
        </tr>
    `).join('');
}

async function addBook(e) {
    e.preventDefault();
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const qty = parseInt(document.getElementById('book-qty').value);

    const { error } = await db.from('books').insert({ title, author, quantity: qty, available: qty });
    if (error) { toast(error.message, 'error'); return; }

    toast(`'${title}' added.`);
    closeModal('add-book-modal');
    e.target.reset();
    loadBooks();
    loadStats();
}

async function editBook(id) {
    const { data: book } = await db.from('books').select('*').eq('id', id).single();
    if (!book) return;
    document.getElementById('edit-book-id').value = book.id;
    document.getElementById('edit-book-title').value = book.title;
    document.getElementById('edit-book-author').value = book.author;
    document.getElementById('edit-book-qty').value = book.quantity;
    openModal('edit-book-modal');
}

async function updateBook(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('edit-book-id').value);
    const title = document.getElementById('edit-book-title').value.trim();
    const author = document.getElementById('edit-book-author').value.trim();
    const newQty = parseInt(document.getElementById('edit-book-qty').value);

    const { data: current } = await db.from('books').select('quantity, available').eq('id', id).single();
    const diff = newQty - current.quantity;
    const newAvail = Math.max(0, current.available + diff);

    const { error } = await db.from('books').update({ title, author, quantity: newQty, available: newAvail }).eq('id', id);
    if (error) { toast(error.message, 'error'); return; }

    toast(`Book #${id} updated.`);
    closeModal('edit-book-modal');
    loadBooks();
    loadStats();
}

async function deleteBook(id, title) {
    if (!confirm(`Delete '${title}'?`)) return;
    const { error } = await db.from('books').delete().eq('id', id);
    if (error) { toast('Cannot delete — book has linked transactions.', 'error'); return; }
    toast(`Book #${id} deleted.`);
    loadBooks();
    loadStats();
}

let bookSearchTimer;
document.getElementById('book-search').addEventListener('input', e => {
    clearTimeout(bookSearchTimer);
    bookSearchTimer = setTimeout(() => loadBooks(e.target.value.trim()), 300);
});

/* Members */

async function loadMembers(filter = '') {
    let query = db.from('members').select('*').order('id');
    if (filter) {
        query = db.from('members').select('*')
            .or(`name.ilike.%${filter}%,email.ilike.%${filter}%`)
            .order('id');
    }

    const { data: members, error } = await query;
    if (error) { toast(error.message, 'error'); return; }

    const tbody = document.querySelector('#members-table tbody');
    const emptyMsg = document.getElementById('members-empty');

    if (!members.length) {
        tbody.innerHTML = '';
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';
    tbody.innerHTML = members.map(m => `
        <tr>
            <td>${m.id}</td>
            <td>${m.name}</td>
            <td>${m.email}</td>
            <td>${m.phone}</td>
            <td class="actions-cell">
                <button class="btn btn-danger btn-sm" onclick="deleteMember(${m.id}, '${m.name.replace(/'/g, "\\'")}')" >Del</button>
            </td>
        </tr>
    `).join('');
}

async function addMember(e) {
    e.preventDefault();
    const name = document.getElementById('member-name').value.trim();
    const email = document.getElementById('member-email').value.trim();
    const phone = document.getElementById('member-phone').value.trim();

    const { error } = await db.from('members').insert({ name, email, phone });
    if (error) {
        const isDupe = error.message.includes('unique') || error.message.includes('duplicate');
        toast(isDupe ? `Email '${email}' already exists.` : error.message, 'error');
        return;
    }

    toast(`'${name}' registered.`);
    closeModal('add-member-modal');
    e.target.reset();
    loadMembers();
    loadStats();
}

async function deleteMember(id, name) {
    if (!confirm(`Delete '${name}'?`)) return;
    const { error } = await db.from('members').delete().eq('id', id);
    if (error) { toast('Cannot delete — member has linked transactions.', 'error'); return; }
    toast(`Member #${id} deleted.`);
    loadMembers();
    loadStats();
}

let memberSearchTimer;
document.getElementById('member-search').addEventListener('input', e => {
    clearTimeout(memberSearchTimer);
    memberSearchTimer = setTimeout(() => loadMembers(e.target.value.trim()), 300);
});

/* Transactions */

async function loadTransactions() {
    const { data: txns, error } = await db
        .from('transactions')
        .select('id, issue_date, return_date, fine, book_id, member_id, books(title), members(name)')
        .is('return_date', null)
        .order('issue_date');

    if (error) { toast(error.message, 'error'); return; }

    const tbody = document.querySelector('#transactions-table tbody');
    const emptyMsg = document.getElementById('txn-empty');

    if (!txns || !txns.length) {
        tbody.innerHTML = '';
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';
    const now = today();

    tbody.innerHTML = txns.map(t => {
        const due = addDays(t.issue_date, DUE_DAYS);
        const daysLeft = daysBetween(now, due);

        let badge, daysCol;
        if (daysLeft < 0) {
            badge = `<span class="badge badge-overdue">⚠ OVERDUE</span>`;
            daysCol = `<span class="days-left urgent">${Math.abs(daysLeft)}d late</span>`;
        } else if (daysLeft <= 2) {
            badge = `<span class="badge badge-warn">Due Soon</span>`;
            daysCol = `<span class="days-left soon">${daysLeft}d left</span>`;
        } else {
            badge = `<span class="badge badge-ok">Active</span>`;
            daysCol = `<span class="days-left ok">${daysLeft}d left</span>`;
        }

        return `
            <tr>
                <td>${t.id}</td>
                <td>${t.books.title}</td>
                <td>${t.members.name}</td>
                <td>${t.issue_date}</td>
                <td>${due}</td>
                <td>${daysCol}</td>
                <td>${badge}</td>
            </tr>`;
    }).join('');
}

async function populateIssueDropdowns() {
    const { data: availBooks } = await db.from('books').select('id, title, available').gt('available', 0).order('title');
    const { data: allMembers } = await db.from('members').select('id, name').order('name');

    const bookSel = document.getElementById('issue-book-id');
    const memberSel = document.getElementById('issue-member-id');

    bookSel.innerHTML = availBooks && availBooks.length
        ? availBooks.map(b => `<option value="${b.id}">${b.title} (${b.available} left)</option>`).join('')
        : '<option disabled>No available books</option>';

    memberSel.innerHTML = allMembers && allMembers.length
        ? allMembers.map(m => `<option value="${m.id}">${m.name}</option>`).join('')
        : '<option disabled>No members</option>';
}

async function issueBook(e) {
    e.preventDefault();
    const bookId = parseInt(document.getElementById('issue-book-id').value);
    const memberId = parseInt(document.getElementById('issue-member-id').value);
    if (!bookId || !memberId) { toast('Select a book and member.', 'error'); return; }

    // prevent duplicate issue
    const { data: existing } = await db.from('transactions')
        .select('id').eq('book_id', bookId).eq('member_id', memberId).is('return_date', null);
    if (existing && existing.length) {
        toast('This member already has this book.', 'error');
        return;
    }

    const { error: insertErr } = await db.from('transactions').insert({
        book_id: bookId, member_id: memberId, issue_date: today()
    });
    if (insertErr) { toast(insertErr.message, 'error'); return; }

    // decrement available count
    const { data: book } = await db.from('books').select('available').eq('id', bookId).single();
    if (book) await db.from('books').update({ available: book.available - 1 }).eq('id', bookId);

    toast('Book issued successfully.');
    closeModal('issue-modal');
    loadBooks();
    loadTransactions();
    loadStats();
}

async function populateReturnDropdown() {
    const { data: activeTxns } = await db
        .from('transactions')
        .select('id, issue_date, books(title), members(name)')
        .is('return_date', null)
        .order('issue_date');

    const sel = document.getElementById('return-txn-id');
    const infoPanel = document.getElementById('return-info');

    if (!activeTxns || !activeTxns.length) {
        sel.innerHTML = '<option disabled>No active issues</option>';
        infoPanel.innerHTML = '<span style="color:var(--text-dim)">Nothing to return.</span>';
        return;
    }

    sel.innerHTML = activeTxns.map(t =>
        `<option value="${t.id}">#${t.id} — ${t.books.title} → ${t.members.name}</option>`
    ).join('');

    showReturnInfo(activeTxns[0]);

    sel.onchange = () => {
        const picked = activeTxns.find(t => t.id === parseInt(sel.value));
        if (picked) showReturnInfo(picked);
    };
}

function showReturnInfo(txn) {
    const infoPanel = document.getElementById('return-info');
    const due = addDays(txn.issue_date, DUE_DAYS);
    const held = daysBetween(txn.issue_date, today());
    const overdue = Math.max(0, held - DUE_DAYS);
    const fine = overdue * FINE_PER_DAY;

    infoPanel.innerHTML = `
        <strong>${txn.books.title}</strong> → ${txn.members.name}<br>
        Issued: ${txn.issue_date} &nbsp;|&nbsp; Due: ${due}<br>
        Held: ${held} day(s)
        ${fine > 0
            ? `<br><span style="color:var(--danger)">Overdue: ${overdue} day(s) — Fine: Rs.${fine}</span>`
            : '<br><span style="color:var(--accent)">On time — no fine</span>'}
    `;
}

async function returnBook(e) {
    e.preventDefault();
    const txnId = parseInt(document.getElementById('return-txn-id').value);
    if (!txnId) { toast('No transaction selected.', 'error'); return; }

    const { data: txn } = await db.from('transactions')
        .select('id, issue_date, book_id').eq('id', txnId).single();
    if (!txn) { toast('Transaction not found.', 'error'); return; }

    const held = daysBetween(txn.issue_date, today());
    const overdue = Math.max(0, held - DUE_DAYS);
    const fine = overdue * FINE_PER_DAY;

    const { error: updateErr } = await db.from('transactions')
        .update({ return_date: today(), fine }).eq('id', txnId);
    if (updateErr) { toast(updateErr.message, 'error'); return; }

    // restore available count
    const { data: book } = await db.from('books').select('available').eq('id', txn.book_id).single();
    if (book) await db.from('books').update({ available: book.available + 1 }).eq('id', txn.book_id);

    toast(fine > 0 ? `Returned. Overdue ${overdue} day(s) — Fine: Rs.${fine}` : 'Returned on time — no fine.');
    closeModal('return-modal');
    loadBooks();
    loadTransactions();
    loadStats();
}

checkAuth();
