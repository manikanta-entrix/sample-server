const  regExConstants = {
  email: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  password: /^[A-Za-z0-9_@%$./#&!+-]{5,25}$/,
  mobile: /\d{10}$/,
  username: /[A-Za-z0-9\s.]{2,35}$/,
}
export default regExConstants;