// import Loading from '../Loading';
import './styles.css';

export default function PrimaryBtn({text, isLoading, onClick, type='submit', styles={}}) {
  return (
   <button style={styles} type={type} className="primary-btn" disabled={isLoading} onClick={onClick}>
    {isLoading ? <Loading/> : text}
   </button>
  )
}