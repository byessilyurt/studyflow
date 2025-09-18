import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';

interface UseTimerProps {
  onSessionComplete?: () => void;
}

export const useTimer = ({ onSessionComplete }: UseTimerProps = {}) => {
  const { state, dispatch } = useAppContext();
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const sessionStartRef = useRef<Date | null>(null);

  const startTimer = () => {
    setIsRunning(true);
    sessionStartRef.current = new Date();
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (sessionStartRef.current) {
      const sessionDuration = Math.floor((Date.now() - sessionStartRef.current.getTime()) / 1000);
      if (sessionDuration > 60) { // Only count sessions longer than 1 minute
        dispatch({
          type: 'COMPLETE_SESSION',
          payload: {
            roomId: state.currentRoom?.id || '',
            startTime: sessionStartRef.current,
            endTime: new Date(),
            focusTime: sessionDuration,
            completed: true
          }
        });
      }
    }
    sessionStartRef.current = null;
  };

  const resetTimer = () => {
    setIsRunning(false);
    sessionStartRef.current = null;
    if (state.currentRoom) {
      const isStudySession = state.currentRoom.sessionType === 'study';
      dispatch({
        type: 'UPDATE_TIMER',
        payload: {
          timeRemaining: isStudySession ? 1500 : 300, // 25 min study, 5 min break
          sessionType: isStudySession ? 'study' : 'break'
        }
      });
    }
  };

  useEffect(() => {
    if (isRunning && state.currentRoom && state.currentRoom.timeRemaining > 0) {
      intervalRef.current = window.setInterval(() => {
        dispatch({
          type: 'UPDATE_TIMER',
          payload: {
            timeRemaining: Math.max(0, state.currentRoom!.timeRemaining - 1),
            sessionType: state.currentRoom!.sessionType
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Handle session completion
      if (isRunning && state.currentRoom && state.currentRoom.timeRemaining === 0) {
        stopTimer();
        onSessionComplete?.();
        
        // Switch session type
        const nextSessionType = state.currentRoom.sessionType === 'study' ? 'break' : 'study';
        const nextDuration = nextSessionType === 'study' ? 1500 : 300;
        
        setTimeout(() => {
          dispatch({
            type: 'UPDATE_TIMER',
            payload: {
              timeRemaining: nextDuration,
              sessionType: nextSessionType
            }
          });
        }, 1000);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, state.currentRoom?.timeRemaining, state.currentRoom?.sessionType, dispatch, onSessionComplete]);

  return {
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
    timeRemaining: state.currentRoom?.timeRemaining || 0,
    sessionType: state.currentRoom?.sessionType || 'study'
  };
};