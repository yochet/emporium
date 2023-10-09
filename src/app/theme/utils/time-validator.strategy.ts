import * as moment from 'moment';


// recibo un string con formato "HH:00"

// retorno un booleano
export function hourIsLowNow(hour:string){
    let now = moment(moment().format('YYYY-MM-DD HH:mm'), 'YYYY-MM-DD HH:mm')
    let hourDate =  moment(moment().format('YYYY-MM-DD')+ ' '+hour, "YYYY-MM-DD HH:mm")

    return  hourDate.isBefore(now)
}