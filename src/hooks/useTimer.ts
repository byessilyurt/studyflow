import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { TIMER_DEFAULTS, minutesToSeconds } from '../constants/timerDefaults';

interface UseTimerProps {
  onSessionComplete?: () => void;
  studyDuration?: number;
  breakDuration?: number;
}

export const useTimer = ({
  onSessionComplete,
  studyDuration = TIMER_DEFAULTS.STUDY_DURATION,
  breakDuration = TIMER_DEFAULTS.BREAK_DURATION
}: UseTimerProps = {}) => {
  const { state, dispatch } = useAppContext();
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const completedSessionTypeRef = useRef<'study' | 'break' | null>(null);

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
          timeRemaining: isStudySession ? minutesToSeconds(studyDuration) : minutesToSeconds(breakDuration),
          sessionType: isStudySession ? 'study' : 'break'
        }
      });
    }
  };

  const setCustomDuration = (minutes: number) => {
    setIsRunning(false);
    sessionStartRef.current = null;
    if (state.currentRoom) {
      dispatch({
        type: 'UPDATE_TIMER',
        payload: {
          timeRemaining: minutes * 60,
          sessionType: state.currentRoom.sessionType
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
        const justCompletedType = state.currentRoom.sessionType;
        completedSessionTypeRef.current = justCompletedType;

        stopTimer();
        onSessionComplete?.();

        // Switch session type immediately without setTimeout race condition
        const nextSessionType = justCompletedType === 'study' ? 'break' : 'study';
        const nextDuration = nextSessionType === 'study'
          ? minutesToSeconds(studyDuration)
          : minutesToSeconds(breakDuration);

        dispatch({
          type: 'UPDATE_TIMER',
          payload: {
            timeRemaining: nextDuration,
            sessionType: nextSessionType
          }
        });
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, state.currentRoom?.timeRemaining, state.currentRoom?.sessionType, dispatch, onSessionComplete, studyDuration, breakDuration]);

  return {
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
    setCustomDuration,
    timeRemaining: state.currentRoom?.timeRemaining || 0,
    sessionType: state.currentRoom?.sessionType || 'study',
    completedSessionType: completedSessionTypeRef.current
  };
};