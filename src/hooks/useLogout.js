import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const useLogout = (sessionError, setSessionError, setIsLoading, setModalContent, emitLogout, email, name, roomId) => {
    
    //hooks
    const history = useHistory();

    if (!roomId)
        roomId = '';

    useEffect(() => {
        if (sessionError !== '') {
            if (email !== '') {
                //Force user logout
                emitLogout(roomId, email, name)
                .then(() => {
                    history.push('/login?err=' + sessionError);
                })
                .catch(err => {
                    setSessionError('');
                    setIsLoading(false);
                    setModalContent({ type:'Error', content: err });
                })
            }
            else
                history.push('/login?err=' + sessionError);
        }
    }, [sessionError]) // eslint-disable-line react-hooks/exhaustive-deps

    const logout = async () => {
        setIsLoading(true);
        try {
            await emitLogout(roomId, email, name);
            setIsLoading(false);
            history.push('/login');
        } catch(err) {
            setIsLoading(false);
            setModalContent({ type: 'Error', content: err });
        }
    }

    return [logout];
}
 
export default useLogout;