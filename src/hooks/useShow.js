import { useContext } from 'react';
import { ShowContext } from '../context/ShowContext';

export function useShow() {
    const context = useContext(ShowContext);
    if (!context) {
        throw new Error('useShow must be used within a ShowProvider');
    }
    return context;
}
