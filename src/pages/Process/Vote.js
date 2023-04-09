function Vote() {
  
  return (
    <div>
      <div>
        <input type="radio" name="option" />
        <label htmlFor="choose">編輯選項</label>
        <span>x</span>
      </div>
      <div>
        <input type="radio" name="option" />
        <label htmlFor="choose">編輯選項</label>
        <span>x</span>
      </div>
      <input type="button" value="+" />
    </div>
  );
}
export default Vote;
