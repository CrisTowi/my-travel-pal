import styles from './TravelerAvatar.module.css';

const TravelerAvatar = ({ traveler, size = 'medium', showName = false }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClass = styles[`avatar${size.charAt(0).toUpperCase() + size.slice(1)}`] || styles.avatarMedium;

  return (
    <div className={styles.container}>
      <div className={`${styles.avatar} ${sizeClass}`} title={traveler.name}>
        {traveler.profilePicture ? (
          <img 
            src={traveler.profilePicture} 
            alt={traveler.name}
            className={styles.image}
          />
        ) : (
          <span className={styles.initials}>{getInitials(traveler.name)}</span>
        )}
      </div>
      {showName && <span className={styles.name}>{traveler.name}</span>}
    </div>
  );
};

export default TravelerAvatar;
