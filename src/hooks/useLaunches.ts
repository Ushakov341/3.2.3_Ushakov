import { useReducer, useEffect } from 'react';
import type { SpaceXLaunch } from '../types/spacex';

interface LaunchesState {
  launches: SpaceXLaunch[];
  loading: boolean;
  error: string | null;
  selectedLaunch: SpaceXLaunch | null;
}

type LaunchesAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: SpaceXLaunch[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SELECT_LAUNCH'; payload: SpaceXLaunch }
  | { type: 'CLEAR_SELECTION' };

const initialState: LaunchesState = {
  launches: [],
  loading: false,
  error: null,
  selectedLaunch: null,
};

function launchesReducer(state: LaunchesState, action: LaunchesAction): LaunchesState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, launches: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SELECT_LAUNCH':
      return { ...state, selectedLaunch: action.payload };
    case 'CLEAR_SELECTION':
      return { ...state, selectedLaunch: null };
    default:
      return state;
  }
}

export function useLaunches() {
  const [state, dispatch] = useReducer(launchesReducer, initialState);

  useEffect(() => {
    const fetchLaunches = async () => {
      dispatch({ type: 'FETCH_START' });
      try {
        const response = await fetch(
          'https://api.spacexdata.com/v3/launches?launch_year=2020'
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: SpaceXLaunch[] = await response.json();
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Fetch error:', errorMessage);
        dispatch({
          type: 'FETCH_ERROR',
          payload: errorMessage,
        });
      }
    };

    fetchLaunches();
  }, []);

  const selectLaunch = (launch: SpaceXLaunch) => {
    dispatch({ type: 'SELECT_LAUNCH', payload: launch });
  };

  const clearSelection = () => {
    dispatch({ type: 'CLEAR_SELECTION' });
  };

  return {
    ...state,
    selectLaunch,
    clearSelection,
  };
}
