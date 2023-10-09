

export function getISVofTotal(price: string, tax: string) {
    let p = Number(price); // incluye
    let t = Number(tax); // porcentaje
    let isv = p - (p / (1 + (t / 100)));
    return isv;
}