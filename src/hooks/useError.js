const useError = () => {
    const errorDescription = (err) => {
        if (err.response) {
            // The request was made and the server responded with a status code
            if (typeof err.response.data.error === 'string')    //for user defined errors
                return err.response.data.error;
            else    
                return 'Something went wrong. ' + err.response.statusText;    //for server errors
        } 
        else {
            // The request was made but no response was received
            return 'Something went wrong. ' + err.message;    //for server errors
        } 
    }

    const sessionExpired = (err) => {
        if (err.response && err.response.status === 401) {
            return true;
        }
        return false;
    }

    return { errorDescription, sessionExpired };
}
 
export default useError;