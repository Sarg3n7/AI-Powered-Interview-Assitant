class SyncService {
  constructor() {
    this.channel = null;
    this.callbacks = new Set();
    this.isSupported = typeof BroadcastChannel !== 'undefined';
    
    if (this.isSupported) {
      this.channel = new BroadcastChannel('swipe-interview-sync');
      this.channel.addEventListener('message', this.handleMessage.bind(this));
    }
  }

  handleMessage(event) {
    const { type, payload } = event.data;
    this.callbacks.forEach(callback => {
      try {
        callback(type, payload);
      } catch (error) {
        console.error('Sync callback error:', error);
      }
    });
  }

  subscribe(callback) {
    this.callbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  broadcast(type, payload) {
    if (this.isSupported && this.channel) {
      try {
        this.channel.postMessage({ type, payload });
      } catch (error) {
        console.error('Broadcast error:', error);
      }
    }
  }

  broadcastAction(action) {
    this.broadcast('REDUX_ACTION', action);
  }

  broadcastTabChange(activeTab) {
    this.broadcast('TAB_CHANGE', { activeTab });
  }

  broadcastTimerUpdate(sessionId, questionIndex, remainingTime) {
    this.broadcast('TIMER_UPDATE', {
      sessionId,
      questionIndex,
      remainingTime,
      timestamp: Date.now(),
    });
  }

  close() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.callbacks.clear();
  }
}

export const syncService = new SyncService();