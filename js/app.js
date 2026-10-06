// dom elements
const productsContainer = document.getElementById('products-container');
const btnAddProduct = document.getElementById('btn-add-product');
const btnGenerate = document.getElementById('btn-generate');

// tax configuration elements
const chkApplyTax = document.getElementById('tax-apply');
const inputTaxPercent = document.getElementById('tax-percent');
const selectDocType = document.getElementById('doc-type');
const selectDocStatus = document.getElementById('doc-status');

// initiliazion 
document.addEventListener('DOMContentLoaded', () => {
    addProductRow();
});

// event listeners 
btnAddProduct.addEventListener('click', () => {
    addProductRow();
});

chkApplyTax.addEventListener('change', (e) => {
    if (e.target.checked) {
        inputTaxPercent.disabled = false;
    } else {
        inputTaxPercent.disabled = true;
        inputTaxPercent.value = '';
        inputTaxPercent.classList.remove('input-error', 'input-success');
    }
    calculateTotals();
});

// adjust status options based on document type 
selectDocType.addEventListener('change', (e) => {
    // clear current options
    while (selectDocStatus.firstChild) {
        selectDocStatus.removeChild(selectDocStatus.firstChild);
    }
    
    const options = e.target.value === 'Cotización' 
        ? ['Pendiente', 'Aprobada', 'Rechazada'] 
        : ['Pendiente', 'Pagada'];
        
    options.forEach(opt => {
        const optionElement = document.createElement('option');
        optionElement.value = opt;
        optionElement.textContent = opt;
        selectDocStatus.appendChild(optionElement);
    });
});

// --- core functions ---

function addProductRow() {
    // create main row container
    const row = document.createElement('div');
    row.classList.add('row', 'g-2', 'align-items-center', 'mb-3', 'product-row');

    // description column
    const colDesc = document.createElement('div');
    colDesc.classList.add('col-md-3', 'col-12');
    const inputDesc = document.createElement('input');
    inputDesc.type = 'text';
    inputDesc.classList.add('form-control', 'prod-desc');
    inputDesc.placeholder = 'Descripción';
    colDesc.appendChild(inputDesc);

    // quantity column
    const colQty = document.createElement('div');
    colQty.classList.add('col-md-2', 'col-6');
    const inputQty = document.createElement('input');
    inputQty.type = 'number';
    inputQty.classList.add('form-control', 'prod-qty');
    inputQty.placeholder = 'Cant.';
    inputQty.min = '1';
    colQty.appendChild(inputQty);

    // price column
    const colPrice = document.createElement('div');
    colPrice.classList.add('col-md-2', 'col-6');
    const inputPrice = document.createElement('input');
    inputPrice.type = 'number';
    inputPrice.classList.add('form-control', 'prod-price');
    inputPrice.placeholder = 'Precio';
    inputPrice.step = '0.01';
    colPrice.appendChild(inputPrice);

    // individual discount column
    const colDisc = document.createElement('div');
    colDisc.classList.add('col-md-2', 'col-6');
    const inputDisc = document.createElement('input');
    inputDisc.type = 'number';
    inputDisc.classList.add('form-control', 'prod-disc');
    inputDisc.placeholder = 'Desc. %';
    inputDisc.min = '0';
    inputDisc.max = '100';
    colDisc.appendChild(inputDisc);

    // subtotal column 
    const colSubtotal = document.createElement('div');
    colSubtotal.classList.add('col-md-2', 'col-6');
    const inputSubtotal = document.createElement('input');
    inputSubtotal.type = 'text';
    inputSubtotal.classList.add('form-control', 'prod-subtotal', 'bg-light');
    inputSubtotal.value = '0.00';
    inputSubtotal.readOnly = true; 
    colSubtotal.appendChild(inputSubtotal);

    // delete Button column
    const colBtn = document.createElement('div');
    colBtn.classList.add('col-md-1', 'col-12', 'text-end');
    const btnDelete = document.createElement('button');
    btnDelete.type = 'button';
    btnDelete.classList.add('btn', 'btn-outline-danger', 'w-100');
    btnDelete.textContent = 'X';
    
    // delete event logic 
    btnDelete.addEventListener('click', () => {
        const currentRows = document.querySelectorAll('.product-row');
        if (currentRows.length > 1) {
            productsContainer.removeChild(row);
            calculateTotals();
        } else {
            alert('Debe existir al menos un producto o servicio en la cotización o factura.');
        }
    });
    colBtn.appendChild(btnDelete);

    inputQty.addEventListener('input', calculateTotals);
    inputPrice.addEventListener('input', calculateTotals);
    inputDisc.addEventListener('input', calculateTotals);

    // asemble row
    row.appendChild(colDesc);
    row.appendChild(colQty);
    row.appendChild(colPrice);
    row.appendChild(colDisc);
    row.appendChild(colSubtotal);
    row.appendChild(colBtn);

    // append to DOM
    productsContainer.appendChild(row);
}

// summary and configuration elements
const inputGenDiscount = document.getElementById('tax-general-discount');
const selectDiscountType = document.getElementById('tax-discount-type');

const sumQty = document.getElementById('sum-qty');
const sumGross = document.getElementById('sum-gross');
const sumProdDiscount = document.getElementById('sum-prod-discount');
const sumNet = document.getElementById('sum-net');
const sumGenDiscount = document.getElementById('sum-gen-discount');
const sumTax = document.getElementById('sum-tax');
const sumTotal = document.getElementById('sum-total');

// listen for changes in general configuration to recalculate
inputTaxPercent.addEventListener('input', calculateTotals);
inputGenDiscount.addEventListener('input', calculateTotals);
selectDiscountType.addEventListener('change', calculateTotals);

// main calculation function
function calculateTotals() {
    const rows = document.querySelectorAll('.product-row');
    
    let countItems = 0;
    let totalGross = 0;
    let totalProdDiscount = 0;
    
    // loop through each product row 
    rows.forEach(row => {
        const qtyInput = row.querySelector('.prod-qty').value;
        const priceInput = row.querySelector('.prod-price').value;
        const discInput = row.querySelector('.prod-disc').value;
        const subtotalInput = row.querySelector('.prod-subtotal');
        
        const qty = parseFloat(qtyInput) || 0;
        const price = parseFloat(priceInput) || 0;
        // if the user leaves the discount empty, we assume 0%
        const discPercent = parseFloat(discInput) || 0; 
        
        const subtotalBruto = qty * price;
        const montoDescInd = subtotalBruto * (discPercent / 100);
        const subtotalFinalFila = subtotalBruto - montoDescInd;
        
        // update the value of the read-only subtotal input
        subtotalInput.value = subtotalFinalFila.toFixed(2);
        
        // accumulators
        countItems += 1;
        totalGross += subtotalBruto;
        totalProdDiscount += montoDescInd;
    });
    
    // general calculations 
    let subtotalBase = totalGross - totalProdDiscount; 
    
    const applyTax = chkApplyTax.checked;
    const taxPercent = applyTax ? (parseFloat(inputTaxPercent.value) || 0) : 0;
    let genDiscPercent = parseFloat(inputGenDiscount.value) || 0;
    
    const discountType = selectDiscountType.value; 
    
    let montoDescGeneral = 0;
    let impuesto = 0;
    let totalFinal = 0;
    
    if (discountType === 'before') {
        // apply discount before tax
        montoDescGeneral = subtotalBase * (genDiscPercent / 100);
        const baseImponible = subtotalBase - montoDescGeneral;
        impuesto = baseImponible * (taxPercent / 100);
        totalFinal = baseImponible + impuesto;
    } else {
        // apply discount after tax
        impuesto = subtotalBase * (taxPercent / 100);
        const totalAntesDescGen = subtotalBase + impuesto;
        montoDescGeneral = totalAntesDescGen * (genDiscPercent / 100);
        totalFinal = totalAntesDescGen - montoDescGeneral;
    }
    
    // the final total must never be negative
    if (totalFinal < 0) {
        totalFinal = 0;
    }
    
    // print results
    sumQty.textContent = countItems;
    sumGross.textContent = totalGross.toFixed(2);
    sumProdDiscount.textContent = totalProdDiscount.toFixed(2);
    sumNet.textContent = subtotalBase.toFixed(2);
    sumGenDiscount.textContent = montoDescGeneral.toFixed(2);
    sumTax.textContent = impuesto.toFixed(2);
    sumTotal.textContent = totalFinal.toFixed(2);
}


// form validation and document generation
const generatedDocument = document.getElementById('generated-document');

btnGenerate.addEventListener('click', () => {
    if (validateForm()) {
        generateInvoiceVisual();
        resetForm();
    }
});

// validation logic
function validateForm() {
    let isValid = true;
    
    // helper to validate a single field
    const check = (inputId, errId, message) => {
        const input = document.getElementById(inputId);
        const err = document.getElementById(errId);
        if (!input.value.trim()) {
            input.classList.add('input-error');
            input.classList.remove('input-success');
            err.textContent = message;
            err.style.display = 'block';
            isValid = false;
        } else {
            input.classList.remove('input-error');
            input.classList.add('input-success');
            err.textContent = '';
            err.style.display = 'none';
        }
    };

    // business and client validations
    check('biz-name', 'err-biz-name', 'Debe ingresar el nombre del negocio.');
    check('biz-id', 'err-biz-id', 'Debe ingresar el RNC.');
    check('biz-phone', 'err-biz-phone', 'Debe ingresar el teléfono.');
    check('biz-email', 'err-biz-email', 'Debe ingresar un correo electrónico válido.');
    check('biz-address', 'err-biz-address', 'Debe ingresar la dirección.');
    
    check('client-name', 'err-client-name', 'Debe ingresar el nombre del cliente.');
    check('client-id', 'err-client-id', 'Debe ingresar la identificación.');
    check('client-phone', 'err-client-phone', 'Debe ingresar el teléfono.');
    check('client-email', 'err-client-email', 'Debe ingresar un correo electrónico válido.');
    check('client-address', 'err-client-address', 'Debe ingresar la dirección.');
    
    // document validations
    check('doc-number', 'err-doc-number', 'El número de documento es requerido.');
    check('doc-issue-date', 'err-doc-issue-date', 'La fecha de emisión es requerida.');
    check('doc-due-date', 'err-doc-due-date', 'La fecha de vencimiento es requerida.');

    // date logic verification
    const issueDate = document.getElementById('doc-issue-date');
    const dueDate = document.getElementById('doc-due-date');
    const errDueDate = document.getElementById('err-doc-due-date');
    if (issueDate.value && dueDate.value) {
        if (new Date(dueDate.value) < new Date(issueDate.value)) {
            dueDate.classList.add('input-error');
            errDueDate.textContent = 'La fecha de vencimiento no puede ser menor que la fecha de emisión.';
            errDueDate.style.display = 'block';
            isValid = false;
        }
    }

    // product validations
    const rows = document.querySelectorAll('.product-row');
    if (rows.length === 0) {
        alert('Debe agregar al menos un producto o servicio válido.');
        isValid = false;
    } else {
        rows.forEach(row => {
            const desc = row.querySelector('.prod-desc');
            const qty = row.querySelector('.prod-qty');
            const price = row.querySelector('.prod-price');
            
            if (!desc.value.trim()) { desc.classList.add('input-error'); isValid = false; } else { desc.classList.remove('input-error'); desc.classList.add('input-success'); }
            if (!qty.value || qty.value <= 0) { qty.classList.add('input-error'); isValid = false; } else { qty.classList.remove('input-error'); qty.classList.add('input-success'); }
            if (!price.value || price.value <= 0) { price.classList.add('input-error'); isValid = false; } else { price.classList.remove('input-error'); price.classList.add('input-success'); }
        });
    }

    // tax validation
    if (chkApplyTax.checked) {
        check('tax-percent', 'err-tax-percent', 'Debe ingresar el porcentaje de impuesto.');
    }

    return isValid;
}

// helper to create dom elements 
function createEl(tag, className = '', textContent = '') {
    const el = document.createElement(tag);
    if (className) {
        className.split(' ').forEach(cls => {
            if (cls) el.classList.add(cls);
        });
    }
    if (textContent) el.textContent = textContent;
    return el;
}

// visual generation
function generateInvoiceVisual() {
    generatedDocument.replaceChildren(); 
    
    const currency = document.getElementById('doc-currency').value;
    const formatMoney = (val) => `${currency} ${parseFloat(val).toFixed(2)}`;

    // main canvas
    const card = createEl('div', 'card shadow-lg border-primary mb-5');
    const cardBody = createEl('div', 'card-body p-5');
    
    // header
    const headerRow = createEl('div', 'row mb-4 border-bottom pb-4');
    const headerCol = createEl('div', 'col-12 text-center text-md-start');
    
    const logoUrl = document.getElementById('biz-logo').value;
    if (logoUrl) {
        const img = createEl('img', 'mb-3');
        img.src = logoUrl;
        img.style.maxHeight = '80px';
        headerCol.appendChild(img);
    }
    
    headerCol.appendChild(createEl('h2', 'fw-bold text-primary mb-1', document.getElementById('biz-name').value));
    headerCol.appendChild(createEl('p', 'mb-0 text-muted', `RNC: ${document.getElementById('biz-id').value} | Tel: ${document.getElementById('biz-phone').value}`));
    headerCol.appendChild(createEl('p', 'mb-0 text-muted', `Email: ${document.getElementById('biz-email').value}`));
    headerCol.appendChild(createEl('p', 'mb-0 text-muted', document.getElementById('biz-address').value));
    
    headerRow.appendChild(headerCol);
    cardBody.appendChild(headerRow);

    // client and document info Grid
    const infoRow = createEl('div', 'row mb-5');
    
    // client Column
    const clientCol = createEl('div', 'col-md-6');
    clientCol.appendChild(createEl('h5', 'fw-bold border-bottom pb-2 text-primary', 'Facturar a:'));
    clientCol.appendChild(createEl('p', 'mb-0 fw-bold fs-5', document.getElementById('client-name').value));
    clientCol.appendChild(createEl('p', 'mb-0', `RNC/ID: ${document.getElementById('client-id').value}`));
    clientCol.appendChild(createEl('p', 'mb-0', `Tel: ${document.getElementById('client-phone').value} | Email: ${document.getElementById('client-email').value}`));
    clientCol.appendChild(createEl('p', 'mb-0', document.getElementById('client-address').value));
    infoRow.appendChild(clientCol);
    
    // document column
    const docCol = createEl('div', 'col-md-6 text-md-end mt-4 mt-md-0');
    const docType = document.getElementById('doc-type').value;
    docCol.appendChild(createEl('h3', 'fw-bold text-uppercase text-secondary mb-3', docType));
    docCol.appendChild(createEl('p', 'mb-0', `No.: ${document.getElementById('doc-number').value}`));
    docCol.appendChild(createEl('p', 'mb-0', `Fecha Emisión: ${document.getElementById('doc-issue-date').value}`));
    docCol.appendChild(createEl('p', 'mb-0', `Fecha Vencimiento: ${document.getElementById('doc-due-date').value}`));
    docCol.appendChild(createEl('p', 'mb-0 fw-bold', `Estado: ${document.getElementById('doc-status').value}`));
    infoRow.appendChild(docCol);

    cardBody.appendChild(infoRow);

    // products table
    const tableContainer = createEl('div', 'table-responsive mb-5');
    const table = createEl('table', 'table table-striped table-bordered');
    const thead = createEl('thead', 'table-dark');
    const trHead = createEl('tr');
    
    ['#', 'Descripción', 'Cantidad', 'Precio unitario', 'Descuento', 'Subtotal'].forEach(text => {
        trHead.appendChild(createEl('th', '', text));
    });
    thead.appendChild(trHead);
    table.appendChild(thead);
    
    const tbody = createEl('tbody');
    const productRows = document.querySelectorAll('.product-row');
    let index = 1;
    productRows.forEach(row => {
        const tr = createEl('tr');
        tr.appendChild(createEl('td', '', index.toString()));
        tr.appendChild(createEl('td', '', row.querySelector('.prod-desc').value));
        tr.appendChild(createEl('td', '', row.querySelector('.prod-qty').value));
        tr.appendChild(createEl('td', '', formatMoney(row.querySelector('.prod-price').value)));
        
        const disc = row.querySelector('.prod-disc').value || '0';
        tr.appendChild(createEl('td', '', `${disc}%`));
        
        tr.appendChild(createEl('td', 'fw-bold', formatMoney(row.querySelector('.prod-subtotal').value)));
        tbody.appendChild(tr);
        index++;
    });
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    cardBody.appendChild(tableContainer);

    // summary section
    const summaryRow = createEl('div', 'row justify-content-end');
    const summaryCol = createEl('div', 'col-md-5');
    const summaryTable = createEl('table', 'table table-sm table-borderless text-end');
    const tbodySum = createEl('tbody');
    
    const addSummaryRow = (label, valueId, isTotal = false) => {
        const tr = createEl('tr');
        if (isTotal) tr.classList.add('border-top', 'border-2', 'border-primary', 'fs-5', 'fw-bold', 'text-primary');
        tr.appendChild(createEl('td', '', label));
        tr.appendChild(createEl('td', '', formatMoney(document.getElementById(valueId).textContent)));
        tbodySum.appendChild(tr);
    };

    addSummaryRow('Subtotal Bruto:', 'sum-gross');
    addSummaryRow('Descuentos por productos:', 'sum-prod-discount');
    addSummaryRow('Subtotal Base:', 'sum-net');
    addSummaryRow('Descuento General:', 'sum-gen-discount');
    addSummaryRow('Impuestos:', 'sum-tax');
    addSummaryRow('Total Final:', 'sum-total', true);
    
    summaryTable.appendChild(tbodySum);
    summaryCol.appendChild(summaryTable);
    summaryRow.appendChild(summaryCol);
    cardBody.appendChild(summaryRow);

    // footer
    const footer = createEl('div', 'text-center mt-5 pt-4 border-top text-muted small');
    const dateNow = new Date();
    footer.appendChild(createEl('p', 'mb-0', `Documento generado el ${dateNow.toLocaleDateString()} a las ${dateNow.toLocaleTimeString()}`));
    cardBody.appendChild(footer);

    card.appendChild(cardBody);
    generatedDocument.appendChild(card);
}

// form reset logic
function resetForm() {
    const form = document.getElementById('invoice-form');
    
    // clear all standard inputs
    const inputs = form.querySelectorAll('input:not(.prod-desc):not(.prod-qty):not(.prod-price):not(.prod-disc):not(.prod-subtotal):not([type="checkbox"])');
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('input-success', 'input-error');
    });

    // reset selects
    const selects = form.querySelectorAll('select');
    selects.forEach(select => {
        select.selectedIndex = 0;
        select.dispatchEvent(new Event('change')); 
    });

    // reset tax checkbox
    chkApplyTax.checked = false;
    chkApplyTax.dispatchEvent(new Event('change'));

    // reset products to just one empty row
    const pRows = document.querySelectorAll('.product-row');
    for (let i = 1; i < pRows.length; i++) {
        productsContainer.removeChild(pRows[i]);
    }
    const firstRow = productsContainer.querySelector('.product-row');
    if (firstRow) {
        firstRow.querySelector('.prod-desc').value = '';
        firstRow.querySelector('.prod-qty').value = '';
        firstRow.querySelector('.prod-price').value = '';
        firstRow.querySelector('.prod-disc').value = '';
        firstRow.querySelector('.prod-subtotal').value = '0.00';
        
        firstRow.querySelectorAll('input').forEach(inp => inp.classList.remove('input-success', 'input-error'));
    }

    // trigger 
    calculateTotals();
    
    generatedDocument.scrollIntoView({ behavior: 'smooth' });
}