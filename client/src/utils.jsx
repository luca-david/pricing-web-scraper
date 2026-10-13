export const createDirectLink = (url, productName) => {
    if (!url) return '#';
    
    //encode name (spaces become %20)
    const encodedName = encodeURIComponent(productName.trim());

    console.log('CreateDirectLink returns ' + `${url}#:~:text=${encodedName}`)
    return `${url}#:~:text=${encodedName}`;
};