document.addEventListener('DOMContentLoaded', function() {
    loadVegetables();
});

function loadVegetables() {
    const itemSelect = document.getElementById('item');
    const vegetables = getVegetablesFromStorage();

    itemSelect.innerHTML = '';
    vegetables.forEach(veg => {
        const option = document.createElement('option');
        option.value = veg.name;
        option.text = `${veg.name} - ${veg.price} Rs/kg`;
        option.setAttribute('data-price', veg.price);
        itemSelect.appendChild(option);
    });
}

function addOrEditVegetable() {
    const newVegetable = document.getElementById('newVegetable').value.trim();
    const newPrice = document.getElementById('newPrice').value.trim();

    if (!newVegetable || !newPrice) {
        alert('Please enter both vegetable name and price.');
        return;
    }

    const vegetables = getVegetablesFromStorage();
    const existingVegIndex = vegetables.findIndex(veg => veg.name.toLowerCase() === newVegetable.toLowerCase());

    if (existingVegIndex !== -1) {
        vegetables[existingVegIndex].price = newPrice;
    } else {
        vegetables.push({ name: newVegetable, price: newPrice });
    }

    localStorage.setItem('vegetables', JSON.stringify(vegetables));

    document.getElementById('newVegetable').value = '';
    document.getElementById('newPrice').value = '';

    loadVegetables();
}

function getVegetablesFromStorage() {
    const vegetables = localStorage.getItem('vegetables');
    return vegetables ? JSON.parse(vegetables) : [];
}

let billItems = [];

function addToBill() {
    const itemSelect = document.getElementById('item');
    const weightInput = document.getElementById('weight');

    const selectedItem = itemSelect.options[itemSelect.selectedIndex];
    const pricePerKg = selectedItem.getAttribute('data-price');
    const weightInGrams = weightInput.value.trim();

    if (weightInGrams <= 0) {
        alert('Please enter a valid weight.');
        return;
    }

    const weightInKg = weightInGrams / 1000;
    const totalPrice = weightInKg * pricePerKg;

    billItems.push({
        name: selectedItem.value,
        weight: weightInGrams,
        pricePerKg: pricePerKg,
        price: totalPrice
    });

    weightInput.value = '';
    displayBill();
}

function displayBill() {
    const billList = document.getElementById('billList');
    const totalPriceEl = document.getElementById('totalPrice');

    billList.innerHTML = '';
    let totalPrice = 0;

    billItems.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name} - ${item.weight} grams - Rs ${item.price.toFixed(2)}`;
        billList.appendChild(listItem);
        totalPrice += item.price;
    });

    totalPriceEl.textContent = `Total Price: Rs ${totalPrice.toFixed(2)}`;
}

function generateBill() {
    if (billItems.length === 0) {
        alert('No items in the bill.');
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Prabhakar Vegetables', 20, 20);
    doc.setFontSize(12);
    doc.text('Vegetable Market Bill', 20, 30);

    const tableColumn = ["S.No", "Vegetable Name", "Quantity (kg)", "Price per kg (Rs)", "Amount (Rs)"];
    const tableRows = [];

    billItems.forEach((item, index) => {
        const itemData = [
            index + 1,
            item.name,
            (item.weight / 1000).toFixed(2),
            item.pricePerKg,
            item.price.toFixed(2)
        ];
        tableRows.push(itemData);
    });

    const totalPrice = billItems.reduce((total, item) => total + item.price, 0);
    const totalRow = ["", "", "", "Total", totalPrice.toFixed(2)];
    tableRows.push(totalRow);

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133] },
        footStyles: { fillColor: [22, 160, 133] }
    });

    doc.save('bill.pdf');
}
