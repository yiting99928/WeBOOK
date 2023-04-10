function QA() {
  return (
    <div>
      <input type="radio" name="option" onChange={console.log(1)} />
      <label htmlFor="choose">選項一</label>
      <input type="radio" name="option" onChange={console.log(1)} />
      <label htmlFor="choose">選項一</label>
      <input type="radio" name="option" onChange={console.log(1)} />
      <label htmlFor="choose">選項一</label>
      <input type="radio" name="option" onChange={console.log(1)} />
      <label htmlFor="choose">選項一</label>
      <hr />
      <div>答案</div>
    </div>
  );
}
export default QA;
