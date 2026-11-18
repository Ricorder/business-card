import { rmSync } from 'node:fs'
import { join } from 'node:path'

export default async function globalTeardown(): Promise<void> {
  rmSync(join(process.cwd(), '.test-db'), { recursive: true, force: true })
}
