
export class Coupon {
    id: number;
    uniqueCode: string;
    type: string;
    value: string;
    dateStart: Date;
    dateEnd: Date;
    maxusedbyuser: string;
    maxcoupons: string;
    minimum_amount: string;
    code_item: string;
    item_name: string;
    idDelete: string;
    active: string;
    valid: boolean;

    constructor(json?: any) {
        if (json) {
            this.id = json.id;
            this.uniqueCode = json.uniqueCode;
            this.type = json.type;
            this.value = json.value;
            this.dateStart = json.dateStart;
            this.dateEnd = json.dateEnd;
            this.maxusedbyuser = json.maxusedbyuser;
            this.code_item = json.code_item;
            this.item_name = json.item_name;
            this.idDelete = json.idDelete;
            this.active = json.active;
            this.valid = true;
        }
    }
}
