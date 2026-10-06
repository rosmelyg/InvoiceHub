// dom elements
const productsContainer = document.getElementById('products-container');
const btnAddProduct = document.getElementById('btn-add-product');
const btnGenerate = document.getElementById('btn-generate');

// tax and document configuration elements
const chkApplyTax = document.getElementById('tax-apply');
const inputTaxPercent = document.getElementById('tax-percent');
const selectDocType = document.getElementById('doc-type');
const selectDocStatus = document.getElementById('doc-status');
const selectDocCurrency = document.getElementById('doc-currency');
const inputGenDiscount = document.getElementById('tax-general-discount');
const selectDiscountType = document.getElementById('tax-discount-type');

// summary elements
const sumQty = document.getElementById('sum-qty');
const sumGross = document.getElementById('sum-gross');
const sumProdDiscount = document.getElementById('sum-prod-discount');
const sumNet = document.getElementById('sum-net');
const sumGenDiscount = document.getElementById('sum-gen-discount');
const sumTax = document.getElementById('sum-tax');
const sumTotal = document.getElementById('sum-total');

const generatedDocument = document.getElementById('generated-document');

// synchronize status options dynamically based on document type
function updateStatusOptions(docType) {
    while (selectDocStatus.firstChild) {
        selectDocStatus.removeChild(selectDocStatus.firstChild);
    }
    
    const options = docType === 'Cotización' 
        ? ['Pendiente', 'Aprobada', 'Rechazada'] 
        : ['Pendiente', 'Pagada'];
        
    options.forEach(opt => {
        const optionElement = document.createElement('option');
        optionElement.value = opt;
        optionElement.textContent = opt;
        selectDocStatus.appendChild(optionElement);
    });
}

// initialization
document.addEventListener('DOMContentLoaded', () => {
    updateStatusOptions(selectDocType.value);
    addProductRow();
    setupLiveValidationClear();
    calculateTotals();
});

// event listeners 
btnAddProduct.addEventListener('click', () => {
    addProductRow();
});

chkApplyTax.addEventListener('change', (e) => {
    const errTaxPercent = document.getElementById('err-tax-percent');
    if (e.target.checked) {
        inputTaxPercent.disabled = false;
    } else {
        inputTaxPercent.disabled = true;
        inputTaxPercent.value = '';
        inputTaxPercent.classList.remove('input-error', 'input-success');
        if (errTaxPercent) {
            errTaxPercent.textContent = '';
            errTaxPercent.style.display = 'none';
        }
    }
    calculateTotals();
});

// adjust status options on document type change
selectDocType.addEventListener('change', (e) => {
    updateStatusOptions(e.target.value);
});

// recalculate summary on configuration or currency changes
selectDocCurrency.addEventListener('change', calculateTotals);
inputTaxPercent.addEventListener('input', calculateTotals);
inputGenDiscount.addEventListener('input', calculateTotals);
selectDiscountType.addEventListener('change', calculateTotals);

// --- core functions ---

function addProductRow() {
    // create main row container
    const row = document.createElement('div');
    row.classList.add('row', 'g-2', 'align-items-start', 'mb-3', 'product-row');

    // description column
    const colDesc = document.createElement('div');
    colDesc.classList.add('col-md-3', 'col-12');
    const inputDesc = document.createElement('input');
    inputDesc.type = 'text';
    inputDesc.classList.add('form-control', 'prod-desc');
    inputDesc.placeholder = 'Descripción';
    const errDesc = document.createElement('div');
    errDesc.classList.add('error-message', 'err-prod-desc');
    colDesc.appendChild(inputDesc);
    colDesc.appendChild(errDesc);

    // quantity column
    const colQty = document.createElement('div');
    colQty.classList.add('col-md-2', 'col-6');
    const inputQty = document.createElement('input');
    inputQty.type = 'number';
    inputQty.classList.add('form-control', 'prod-qty');
    inputQty.placeholder = 'Cant.';
    inputQty.min = '1';
    inputQty.step = '1';
    const errQty = document.createElement('div');
    errQty.classList.add('error-message', 'err-prod-qty');
    colQty.appendChild(inputQty);
    colQty.appendChild(errQty);

    // price column
    const colPrice = document.createElement('div');
    colPrice.classList.add('col-md-2', 'col-6');
    const inputPrice = document.createElement('input');
    inputPrice.type = 'number';
    inputPrice.classList.add('form-control', 'prod-price');
    inputPrice.placeholder = 'Precio';
    inputPrice.step = '0.01';
    inputPrice.min = '0.01';
    const errPrice = document.createElement('div');
    errPrice.classList.add('error-message', 'err-prod-price');
    colPrice.appendChild(inputPrice);
    colPrice.appendChild(errPrice);

    // individual discount column
    const colDisc = document.createElement('div');
    colDisc.classList.add('col-md-2', 'col-6');
    const inputDisc = document.createElement('input');
    inputDisc.type = 'number';
    inputDisc.classList.add('form-control', 'prod-disc');
    inputDisc.placeholder = 'Desc. %';
    inputDisc.min = '0';
    inputDisc.max = '100';
    inputDisc.step = '0.01';
    const errDisc = document.createElement('div');
    errDisc.classList.add('error-message', 'err-prod-disc');
    colDisc.appendChild(inputDisc);
    colDisc.appendChild(errDisc);

    // subtotal column 
    const colSubtotal = document.createElement('div');
    colSubtotal.classList.add('col-md-2', 'col-6');
    const inputSubtotal = document.createElement('input');
    inputSubtotal.type = 'text';
    inputSubtotal.classList.add('form-control', 'prod-subtotal', 'bg-light');
    inputSubtotal.value = '0.00';
    inputSubtotal.readOnly = true; 
    colSubtotal.appendChild(inputSubtotal);

    // delete button column
    const colBtn = document.createElement('div');
    colBtn.classList.add('col-md-1', 'col-12', 'text-end');
    const btnDelete = document.createElement('button');
    btnDelete.type = 'button';
    btnDelete.classList.add('btn', 'btn-outline-danger', 'btn-sm', 'btn-delete-prod', 'w-100');
    btnDelete.textContent = 'Eliminar';
    
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

    // clear row errors dynamically on user input
    const setupInputClear = (inputEl, errEl) => {
        inputEl.addEventListener('input', () => {
            inputEl.classList.remove('input-error');
            errEl.textContent = '';
            errEl.style.display = 'none';
        });
    };
    setupInputClear(inputDesc, errDesc);
    setupInputClear(inputQty, errQty);
    setupInputClear(inputPrice, errPrice);
    setupInputClear(inputDisc, errDisc);

    inputQty.addEventListener('input', calculateTotals);
    inputPrice.addEventListener('input', calculateTotals);
    inputDisc.addEventListener('input', calculateTotals);

    // assemble row
    row.appendChild(colDesc);
    row.appendChild(colQty);
    row.appendChild(colPrice);
    row.appendChild(colDisc);
    row.appendChild(colSubtotal);
    row.appendChild(colBtn);

    // append to DOM
    productsContainer.appendChild(row);
}

// main calculation function
function calculateTotals() {
    const rows = document.querySelectorAll('.product-row');
    const currency = selectDocCurrency ? selectDocCurrency.value : 'DOP';
    
    let countItems = 0;
    let totalGross = 0;
    let totalProdDiscount = 0;
    
    // loop through each product row 
    rows.forEach(row => {
        const descInput = row.querySelector('.prod-desc').value.trim();
        const qtyInput = row.querySelector('.prod-qty').value.trim();
        const priceInput = row.querySelector('.prod-price').value.trim();
        const discInput = row.querySelector('.prod-disc').value.trim();
        const subtotalInput = row.querySelector('.prod-subtotal');
        
        // Count product only if row has user-entered data
        if (descInput || qtyInput || priceInput || discInput) {
            countItems += 1;
        }

        const qty = parseFloat(qtyInput) || 0;
        const price = parseFloat(priceInput) || 0;
        // if user leaves discount empty, assume 0%
        const discPercent = parseFloat(discInput) || 0; 
        
        const subtotalBruto = qty * price;
        const montoDescInd = subtotalBruto * (discPercent / 100);
        const subtotalFinalFila = subtotalBruto - montoDescInd;
        
        // update the value of the read-only subtotal input
        subtotalInput.value = subtotalFinalFila.toFixed(2);
        
        // accumulators
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
    
    // print results with currency (PDF pages 9, 20, 23)
    sumQty.textContent = countItems;
    sumGross.textContent = `${currency} ${totalGross.toFixed(2)}`;
    sumProdDiscount.textContent = `${currency} ${totalProdDiscount.toFixed(2)}`;
    sumNet.textContent = `${currency} ${subtotalBase.toFixed(2)}`;
    sumGenDiscount.textContent = `${currency} ${montoDescGeneral.toFixed(2)}`;
    sumTax.textContent = `${currency} ${impuesto.toFixed(2)}`;
    sumTotal.textContent = `${currency} ${totalFinal.toFixed(2)}`;
}

// validation helpers
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function isValidUrl(urlString) {
    try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// real-time error cleanup for static form fields
function setupLiveValidationClear() {
    const fields = [
        { id: 'biz-name', errId: 'err-biz-name' },
        { id: 'biz-id', errId: 'err-biz-id' },
        { id: 'biz-phone', errId: 'err-biz-phone' },
        { id: 'biz-email', errId: 'err-biz-email' },
        { id: 'biz-address', errId: 'err-biz-address' },
        { id: 'biz-logo', errId: 'err-biz-logo' },
        { id: 'client-name', errId: 'err-client-name' },
        { id: 'client-id', errId: 'err-client-id' },
        { id: 'client-phone', errId: 'err-client-phone' },
        { id: 'client-email', errId: 'err-client-email' },
        { id: 'client-address', errId: 'err-client-address' },
        { id: 'doc-number', errId: 'err-doc-number' },
        { id: 'doc-issue-date', errId: 'err-doc-issue-date' },
        { id: 'doc-due-date', errId: 'err-doc-due-date' },
        { id: 'tax-percent', errId: 'err-tax-percent' },
        { id: 'tax-general-discount', errId: 'err-tax-general-discount' }
    ];

    fields.forEach(item => {
        const input = document.getElementById(item.id);
        const err = document.getElementById(item.errId);
        if (input && err) {
            const clearError = () => {
                input.classList.remove('input-error');
                err.textContent = '';
                err.style.display = 'none';
            };
            input.addEventListener('input', clearError);
            input.addEventListener('change', clearError);
        }
    });
}

// form validation and document generation
btnGenerate.addEventListener('click', () => {
    if (validateForm()) {
        generateInvoiceVisual();
        resetForm();
    }
});

// validation logic
function validateForm() {
    let isValid = true;
    
    const showError = (input, err, message) => {
        input.classList.add('input-error');
        input.classList.remove('input-success');
        err.textContent = message;
        err.style.display = 'block';
        isValid = false;
    };

    const showSuccess = (input, err) => {
        input.classList.remove('input-error');
        input.classList.add('input-success');
        err.textContent = '';
        err.style.display = 'none';
    };

    const checkRequired = (inputId, errId, message) => {
        const input = document.getElementById(inputId);
        const err = document.getElementById(errId);
        if (!input.value.trim()) {
            showError(input, err, message);
        } else {
            showSuccess(input, err);
        }
    };

    const checkEmail = (inputId, errId) => {
        const input = document.getElementById(inputId);
        const err = document.getElementById(errId);
        const val = input.value.trim();
        if (!val || !isValidEmail(val)) {
            showError(input, err, 'Debe ingresar un correo electrónico válido.');
        } else {
            showSuccess(input, err);
        }
    };

    // business validations
    checkRequired('biz-name', 'err-biz-name', 'Debe ingresar el nombre del negocio.');
    checkRequired('biz-id', 'err-biz-id', 'Debe ingresar el RNC.');
    checkRequired('biz-phone', 'err-biz-phone', 'Debe ingresar el teléfono.');
    checkEmail('biz-email', 'err-biz-email');
    checkRequired('biz-address', 'err-biz-address', 'Debe ingresar la dirección.');

    // logo url validation (optional)
    const bizLogo = document.getElementById('biz-logo');
    const errBizLogo = document.getElementById('err-biz-logo');
    if (bizLogo.value.trim() !== '') {
        if (!isValidUrl(bizLogo.value.trim())) {
            showError(bizLogo, errBizLogo, 'Debe ingresar una URL válida para el logo.');
        } else {
            showSuccess(bizLogo, errBizLogo);
        }
    } else {
        bizLogo.classList.remove('input-error', 'input-success');
        errBizLogo.textContent = '';
        errBizLogo.style.display = 'none';
    }

    // client validations
    checkRequired('client-name', 'err-client-name', 'Debe ingresar el nombre del cliente.');
    checkRequired('client-id', 'err-client-id', 'Debe ingresar la identificación.');
    checkRequired('client-phone', 'err-client-phone', 'Debe ingresar el teléfono.');
    checkEmail('client-email', 'err-client-email');
    checkRequired('client-address', 'err-client-address', 'Debe ingresar la dirección.');
    
    // document validations
    checkRequired('doc-number', 'err-doc-number', 'El número de documento es requerido.');
    checkRequired('doc-issue-date', 'err-doc-issue-date', 'La fecha de emisión es requerida.');
    
    // due date validations
    const issueDate = document.getElementById('doc-issue-date');
    const dueDate = document.getElementById('doc-due-date');
    const errDueDate = document.getElementById('err-doc-due-date');
    if (!dueDate.value) {
        showError(dueDate, errDueDate, 'La fecha de vencimiento es requerida.');
    } else if (issueDate.value && new Date(dueDate.value) < new Date(issueDate.value)) {
        showError(dueDate, errDueDate, 'La fecha de vencimiento no puede ser menor que la fecha de emisión.');
    } else {
        showSuccess(dueDate, errDueDate);
    }

    // product validations
    const rows = document.querySelectorAll('.product-row');
    if (rows.length === 0) {
        alert('Debe agregar al menos un producto o servicio válido.');
        isValid = false;
    } else {
        let hasValidRow = false;
        rows.forEach(row => {
            const desc = row.querySelector('.prod-desc');
            const qty = row.querySelector('.prod-qty');
            const price = row.querySelector('.prod-price');
            const disc = row.querySelector('.prod-disc');
            
            const errDesc = row.querySelector('.err-prod-desc');
            const errQty = row.querySelector('.err-prod-qty');
            const errPrice = row.querySelector('.err-prod-price');
            const errDisc = row.querySelector('.err-prod-disc');

            let rowValid = true;

            // description check
            if (!desc.value.trim()) {
                showError(desc, errDesc, 'Debe ingresar la descripción.');
                rowValid = false;
            } else {
                showSuccess(desc, errDesc);
            }

            // quantity check (integer > 0, no decimals)
            const qtyVal = Number(qty.value);
            if (!qty.value.trim() || isNaN(qtyVal) || !Number.isInteger(qtyVal) || qtyVal <= 0) {
                showError(qty, errQty, 'La cantidad debe ser un número entero mayor que cero. No se permiten cantidades decimales.');
                rowValid = false;
            } else {
                showSuccess(qty, errQty);
            }

            // price check (number > 0)
            const priceVal = parseFloat(price.value);
            if (!price.value.trim() || isNaN(priceVal) || priceVal <= 0) {
                showError(price, errPrice, 'El precio unitario debe ser mayor que cero.');
                rowValid = false;
            } else {
                showSuccess(price, errPrice);
            }

            // individual discount check (between 0 and 100)
            if (disc.value.trim() !== '') {
                const discVal = parseFloat(disc.value);
                if (isNaN(discVal) || discVal < 0 || discVal > 100) {
                    showError(disc, errDisc, 'El descuento individual debe estar entre 0 y 100.');
                    rowValid = false;
                } else {
                    showSuccess(disc, errDisc);
                }
            } else {
                disc.classList.remove('input-error');
                errDisc.textContent = '';
                errDisc.style.display = 'none';
            }

            if (rowValid) {
                hasValidRow = true;
            }
        });

        if (!hasValidRow) {
            isValid = false;
        }
    }

    // general discount validation
    const errGenDiscount = document.getElementById('err-tax-general-discount');
    if (inputGenDiscount.value.trim() !== '') {
        const genDiscVal = parseFloat(inputGenDiscount.value);
        if (isNaN(genDiscVal) || genDiscVal < 0 || genDiscVal > 100) {
            showError(inputGenDiscount, errGenDiscount, 'El descuento general debe estar entre 0 y 100.');
        } else {
            showSuccess(inputGenDiscount, errGenDiscount);
        }
    } else {
        inputGenDiscount.classList.remove('input-error');
        errGenDiscount.textContent = '';
        errGenDiscount.style.display = 'none';
    }

    // tax percentage validation
    const errTaxPercent = document.getElementById('err-tax-percent');
    if (chkApplyTax.checked) {
        const taxVal = parseFloat(inputTaxPercent.value);
        if (!inputTaxPercent.value.trim()) {
            showError(inputTaxPercent, errTaxPercent, 'Debe ingresar el porcentaje de impuesto.');
        } else if (isNaN(taxVal) || taxVal < 0 || taxVal > 100) {
            showError(inputTaxPercent, errTaxPercent, 'El porcentaje de impuesto debe estar entre 0 y 100.');
        } else {
            showSuccess(inputTaxPercent, errTaxPercent);
        }
    } else {
        inputTaxPercent.classList.remove('input-error');
        errTaxPercent.textContent = '';
        errTaxPercent.style.display = 'none';
    }

    return isValid;
}

// helper to create DOM elements
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

// visual document generation
function generateInvoiceVisual() {
    generatedDocument.replaceChildren(); 
    
    const currency = selectDocCurrency.value;
    const formatMoney = (val) => `${currency} ${parseFloat(val).toFixed(2)}`;

    // section heading
    const secTitle = createEl('h3', 'fw-bold mb-4 text-primary text-center text-md-start', 'Documento generado');
    generatedDocument.appendChild(secTitle);

    // main card
    const card = createEl('div', 'card shadow-lg border-primary mb-5');
    const cardBody = createEl('div', 'card-body p-5');
    
    // header
    const headerRow = createEl('div', 'row mb-4 border-bottom pb-4');
    const headerCol = createEl('div', 'col-12 text-center text-md-start');
    
    const logoUrl = document.getElementById('biz-logo').value.trim();
    if (logoUrl) {
        const img = createEl('img', 'mb-3');
        img.src = logoUrl;
        img.alt = 'Logo del negocio';
        img.style.maxHeight = '80px';
        headerCol.appendChild(img);
    }
    
    headerCol.appendChild(createEl('h2', 'fw-bold text-primary mb-1', document.getElementById('biz-name').value));
    headerCol.appendChild(createEl('p', 'mb-0 text-muted', `RNC: ${document.getElementById('biz-id').value} | Tel: ${document.getElementById('biz-phone').value}`));
    headerCol.appendChild(createEl('p', 'mb-0 text-muted', `Email: ${document.getElementById('biz-email').value}`));
    headerCol.appendChild(createEl('p', 'mb-0 text-muted', document.getElementById('biz-address').value));
    
    headerRow.appendChild(headerCol);
    cardBody.appendChild(headerRow);

    // client and document info grid
    const infoRow = createEl('div', 'row mb-5');
    
    // client column
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
    docCol.appendChild(createEl('p', 'mb-0', `Moneda: ${currency}`));
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
        // textContent already contains currency and two decimals
        tr.appendChild(createEl('td', '', document.getElementById(valueId).textContent));
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
    
    // clear standard text and numeric inputs
    const inputs = form.querySelectorAll('input:not(.prod-desc):not(.prod-qty):not(.prod-price):not(.prod-disc):not(.prod-subtotal):not([type="checkbox"])');
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('input-success', 'input-error');
    });

    // clear all error messages in form
    form.querySelectorAll('.error-message').forEach(err => {
        err.textContent = '';
        err.style.display = 'none';
    });

    // reset selects to initial option
    const selects = form.querySelectorAll('select');
    selects.forEach(select => {
        select.selectedIndex = 0;
        select.dispatchEvent(new Event('change')); 
    });

    // reset tax checkbox
    chkApplyTax.checked = false;
    chkApplyTax.dispatchEvent(new Event('change'));

    // reset products to single empty row
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
        firstRow.querySelectorAll('.error-message').forEach(err => {
            err.textContent = '';
            err.style.display = 'none';
        });
    }

    // trigger totals recalculation (resets summary to zero)
    calculateTotals();
    
    generatedDocument.scrollIntoView({ behavior: 'smooth' });
}