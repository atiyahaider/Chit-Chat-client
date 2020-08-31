export const formatDate = (date) => {
    let today = new Date();
    today.setHours(0,0,0,0);

    let date2 = new Date(date);
    date2.setHours(0,0,0,0);

    if(today.valueOf() === date2.valueOf())
        return new Date(date).toLocaleTimeString('en-US');
    else
        return new Date(date).toLocaleString('en-US');
}