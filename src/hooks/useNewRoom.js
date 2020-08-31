const useNewRoom = (setModalContent, setIsLoading, emitNewRoom) => {

    const createNewRoom = async (room) => {
        if (room.trim() === '') {
            setModalContent({ type: 'Error', content: 'Please enter a name for the chatroom' });
            return;
        }

        setIsLoading(true);
        try {
            await emitNewRoom(room);
            setIsLoading(false);
        } catch(err) {
            setIsLoading(false);
            setModalContent({ type: 'Error', content: err });
        }
    }
    
    return [createNewRoom];
}
 
export default useNewRoom;