import type { MetricStripProps } from './metric-strip.types'
import styles from './metric-strip.module.css'

/** Три цифры над списком мест работы: то, за что цепляется рекрутер. */
export function MetricStrip({ metrics }: MetricStripProps) {
  return (
    <ul className={styles.strip}>
      {metrics.map((metric) => (
        <li className={styles.card} key={metric.id}>
          <p className={styles.value}>{metric.value}</p>
          <p className={styles.label}>{metric.label}</p>
          {metric.detail ? <p className={styles.detail}>{metric.detail}</p> : null}
        </li>
      ))}
    </ul>
  )
}
