import Image from 'next/image';
import Link from 'next/link';

import styles from './HomepageATeam.module.scss';

export default function HomepageATeam() {
  return (
    <div className="bg-green">
    <section className={styles.mintBand}>
      <div className={styles.container}>
        <div className={styles.layout}>
          {/* Media */}
          <figure className={styles.media}>
            <Image
              src="/home/networking-event-guests-laughing-strawberry-tables.jpg"
              width={1600}
              height={1067}
              alt="Guests laughing and socializing around red tablecloth cocktail tables with bowls of strawberries at a networking event."
              className={styles.image}
            />
          </figure>

          {/* Card */}
          <div className={styles.card}>
            <h2 className={styles.heading}>Partner with the Event Planning A-Team</h2>

            <p>
              As Cal Poly’s in house event planning team, our staff is embedded with all aspects of the
              university, its systems, offerings and the colleagues who make it run.
            </p>
            <p className={styles.bodyBottom}>
              This enables us to offer seamless event solutions and easily manage, organize and schedule all
              facets of your successful event and amazing experience.
            </p>

            <p className={styles.ctaRow}>
              <Link legacyBehavior href="/plan/team/">
                <a className={styles.link} title="Meet the team">
                  <span>Meet the team</span>
                </a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}
