

describe('toggleMute function', () => {
  it('should toggle mute state', () => {
    const localStream = {
      getAudioTracks: jest.fn(() => [
        {
          enabled: true,
        },
      ]),
    };

    // 調用 toggleMute 函數
    const isMuted = toggleMute(localStream);

    // 驗證 mute 狀態是否已切換
    expect(localStream.getAudioTracks()[0].enabled).toBe(false);
    expect(isMuted).toBe(false);
  });
});
