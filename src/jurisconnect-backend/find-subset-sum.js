const data = {
    'Talita Coutinho Advogados': 400.00,
    'Thiago Coriolano': 750.00,
    'Raíssa - Concreserv': 360.00,
    'Beatriz Aragão & Bernardo': 1050.00,
    'Diego Carrara Palandrani': 450.00,
    'Igor Matheus': 200.00,
    'Maria Juliana ABLaw': 700.00,
    'Lacosta Advogados': 740.00,
    'Fett Advogados Bruna Ferracini': 1400.00,
    'Ivan Rodrigues': 600.00,
    'Maria Paula - Ayres Monteiro': 130.00,
    'Rodrigo Bezerra': 250.00,
    'Jessica': 1000.00,
    'Vinicius Andrade': 350.00,
    'Gabriel Luna Juveniz Adv': 1000.00,
    'Julia - Teixeira e Marques': 210.00,
    'Karla Martins Cruz': 200.00,
    'Juliana Moura ABLaw': 220.00,
    'Maxxi Consultoria': 600.00,
    'Leonardo - Advocacia Soller': 300.00,
    'Gabriele - Lombardi e Boeng Advogados': 200.00,
    'Sepulveda Advogados': 180.00,
    'Thulyo Augustto': 250.00
};

const target = 4770.00;
const keys = Object.keys(data);
const values = Object.values(data);

function findSubset(index, currentSum, currentItems) {
    if (Math.abs(currentSum - target) < 0.01) {
        console.log('Found match:', currentItems);
        return true;
    }
    if (index >= values.length || currentSum > target) {
        return false;
    }

    // Include current item
    if (findSubset(index + 1, currentSum + values[index], [...currentItems, keys[index]])) {
        return true;
    }

    // Exclude current item
    if (findSubset(index + 1, currentSum, currentItems)) {
        return true;
    }

    return false;
}

console.log(`Searching for subset summing to ${target}...`);
findSubset(0, 0, []);
