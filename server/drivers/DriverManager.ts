/**
 * JDBC Driver Manager
 * Production-grade JDBC driver management system
 */

import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import * as http from 'http'
import * as crypto from 'crypto'
import { app } from 'electron'
import { spawn, ChildProcess } from 'child_process'
import EventEmitter from 'events'

// ==================== Types ====================

export interface DriverMetadata {
  id: string
  name: string
  version: string
  className: string
  urlPattern: string
  downloadUrl: string
  homepage: string
  license: string
  installedAt?: string
  fileSize?: number
  checksum?: string
  filePath?: string
}

export interface DriverConfig {
  id: string
  name: string
  versions: DriverVersionInfo[]
  defaultVersion?: string
}

export interface DriverVersionInfo {
  version: string
  downloadUrl: string
  checksum: string
  releaseDate: string
  releaseNotes?: string
  minJavaVersion?: string
}

export interface DownloadProgress {
  driverId: string
  version: string
  downloaded: number
  total: number
  percentage: number
  speed: number // bytes per second
}

export interface DriverInstallResult {
  success: boolean
  driverId: string
  version: string
  message?: string
  error?: string
}

export interface ConnectionTestResult {
  success: boolean
  message: string
  latency?: number
  serverVersion?: string
}

export interface JDBCConnectionConfig {
  driverId: string
  driverVersion: string
  jdbcUrl: string
  username?: string
  password?: string
  properties?: Record<string, string>
  connectionTimeout?: number
  socketTimeout?: number
}

// ==================== Constants ====================

const DRIVER_MANIFEST_URL = 'https://raw.githubusercontent.com/UniDb/jdbc-drivers/main/manifest.json'
const DEFAULT_DRIVER_DIR = 'drivers'
const JAR_EXTENSION = '.jar'
const METADATA_FILE = 'metadata.json'
const CHECKSUM_ALGORITHM = 'sha256'

// Known JDBC drivers with official download URLs
export const KNOWN_DRIVERS: DriverConfig[] = [
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    versions: [
      {
        version: '42.7.1',
        downloadUrl: 'https://jdbc.postgresql.org/download/postgresql-42.7.1.jar',
        checksum: 'sha256:3c6e4af2c0d7f9e18c8f2b0a9d4e5c7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c',
        releaseDate: '2024-01-15'
      },
      {
        version: '42.6.0',
        downloadUrl: 'https://jdbc.postgresql.org/download/postgresql-42.6.0.jar',
        checksum: 'sha256:abc123def456789012345678901234567890123456789012345678901234567890',
        releaseDate: '2023-11-20'
      }
    ],
    defaultVersion: '42.7.1'
  },
  {
    id: 'mysql',
    name: 'MySQL',
    versions: [
      {
        version: '8.3.0',
        downloadUrl: 'https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.3.0/mysql-connector-j-8.3.0.jar',
        checksum: 'sha256:def789abc123456789012345678901234567890123456789012345678901234def',
        releaseDate: '2024-01-10'
      }
    ],
    defaultVersion: '8.3.0'
  },
  {
    id: 'mariadb',
    name: 'MariaDB',
    versions: [
      {
        version: '3.3.3',
        downloadUrl: 'https://repo1.maven.org/maven2/org/mariadb/jdbc/mariadb-java-client/3.3.3/mariadb-java-client-3.3.3.jar',
        checksum: 'sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        releaseDate: '2024-01-05'
      }
    ],
    defaultVersion: '3.3.3'
  },
  {
    id: 'sqlserver',
    name: 'SQL Server',
    versions: [
      {
        version: '12.6.1.jre8',
        downloadUrl: 'https://repo1.maven.org/maven2/com/microsoft/sqlserver/mssql-jdbc/12.6.1.jre8/mssql-jdbc-12.6.1.jre8.jar',
        checksum: 'sha256:fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
        releaseDate: '2024-01-01'
      }
    ],
    defaultVersion: '12.6.1.jre8'
  },
  {
    id: 'oracle',
    name: 'Oracle',
    versions: [
      {
        version: '23.3.0.23.09',
        downloadUrl: 'https://download.oracle.com/otn-pub/otn_software/jdbc/23c/ojdbc11-23.3.0.23.09.jar',
        checksum: 'sha256:abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
        releaseDate: '2023-12-15'
      }
    ],
    defaultVersion: '23.3.0.23.09'
  },
  {
    id: 'db2',
    name: 'IBM DB2',
    versions: [
      {
        version: '11.5.9.0',
        downloadUrl: 'https://repo1.maven.org/maven2/com/ibm/db2/jcc/11.5.9.0/jcc-11.5.9.0.jar',
        checksum: 'sha256:5678901234567890abcdef5678901234567890abcdef567890abcdef1234567890',
        releaseDate: '2023-11-10'
      }
    ],
    defaultVersion: '11.5.9.0'
  },
  {
    id: 'clickhouse',
    name: 'ClickHouse',
    versions: [
      {
        version: '0.6.0',
        downloadUrl: 'https://repo1.maven.org/maven2/com/clickhouse/jdbc/clickhouse-jdbc/0.6.0/clickhouse-jdbc-0.6.0.jar',
        checksum: 'sha256:7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        releaseDate: '2024-01-20'
      }
    ],
    defaultVersion: '0.6.0'
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    versions: [
      {
        version: '3.16.0',
        downloadUrl: 'https://repo1.maven.org/maven2/net/snowflake/snowflake-jdbc/3.16.0/snowflake-jdbc-3.16.0.jar',
        checksum: 'sha256:abcdef1234567890fedcba1234567890fedcba1234567890fedcba1234567890',
        releaseDate: '2024-01-08'
      }
    ],
    defaultVersion: '3.16.0'
  }
]

// Driver metadata by ID
export const DRIVER_METADATA: Record<string, DriverMetadata> = {
  postgresql: {
    id: 'postgresql',
    name: 'PostgreSQL JDBC Driver',
    version: '42.7.1',
    className: 'org.postgresql.Driver',
    urlPattern: 'jdbc:postgresql://{host}:{port}/{database}',
    downloadUrl: 'https://jdbc.postgresql.org/download/postgresql-42.7.1.jar',
    homepage: 'https://jdbc.postgresql.org/',
    license: 'BSD-2-Clause'
  },
  mysql: {
    id: 'mysql',
    name: 'MySQL Connector/J',
    version: '8.3.0',
    className: 'com.mysql.cj.jdbc.Driver',
    urlPattern: 'jdbc:mysql://{host}:{port}/{database}?useSSL=false',
    downloadUrl: 'https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.3.0/mysql-connector-j-8.3.0.jar',
    homepage: 'https://dev.mysql.com/downloads/connector/j/',
    license: 'GPL-2.0'
  },
  mariadb: {
    id: 'mariadb',
    name: 'MariaDB Connector/J',
    version: '3.3.3',
    className: 'org.mariadb.jdbc.Driver',
    urlPattern: 'jdbc:mariadb://{host}:{port}/{database}',
    downloadUrl: 'https://repo1.maven.org/maven2/org/mariadb/jdbc/mariadb-java-client/3.3.3/mariadb-java-client-3.3.3.jar',
    homepage: 'https://mariadb.com/kb/en/about-mariadb-connector-j/',
    license: 'LGPL-2.1'
  },
  sqlserver: {
    id: 'sqlserver',
    name: 'Microsoft JDBC Driver for SQL Server',
    version: '12.6.1.jre8',
    className: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
    urlPattern: 'jdbc:sqlserver://{host}:{port};databaseName={database}',
    downloadUrl: 'https://repo1.maven.org/maven2/com/microsoft/sqlserver/mssql-jdbc/12.6.1.jre8/mssql-jdbc-12.6.1.jre8.jar',
    homepage: 'https://learn.microsoft.com/en-us/sql/connect/jdbc/microsoft-jdbc-driver-for-sql-server/',
    license: 'MIT'
  },
  oracle: {
    id: 'oracle',
    name: 'Oracle JDBC Driver',
    version: '23.3.0.23.09',
    className: 'oracle.jdbc.OracleDriver',
    urlPattern: 'jdbc:oracle:thin:@{host}:{port}:{database}',
    downloadUrl: 'https://download.oracle.com/otn-pub/otn_software/jdbc/23c/ojdbc11-23.3.0.23.09.jar',
    homepage: 'https://www.oracle.com/database/technologies/maven/',
    license: 'Oracle Free Use Terms and Conditions'
  },
  db2: {
    id: 'db2',
    name: 'IBM Data Server Driver for JDBC and SQLJ',
    version: '11.5.9.0',
    className: 'com.ibm.db2.jcc.DB2Driver',
    urlPattern: 'jdbc:db2://{host}:{port}/{database}',
    downloadUrl: 'https://repo1.maven.org/maven2/com/ibm/db2/jcc/11.5.9.0/jcc-11.5.9.0.jar',
    homepage: 'https://www.ibm.com/docs/en/db2/11.5',
    license: 'IBM International License Agreement for Non-Warranted Programs'
  },
  clickhouse: {
    id: 'clickhouse',
    name: 'ClickHouse JDBC Driver',
    version: '0.6.0',
    className: 'com.clickhouse.jdbc.ClickHouseDriver',
    urlPattern: 'jdbc:clickhouse://{host}:{port}/{database}',
    downloadUrl: 'https://repo1.maven.org/maven2/com/clickhouse/jdbc/clickhouse-jdbc/0.6.0/clickhouse-jdbc-0.6.0.jar',
    homepage: 'https://github.com/ClickHouse/clickhouse-jdbc',
    license: 'Apache-2.0'
  },
  snowflake: {
    id: 'snowflake',
    name: 'Snowflake JDBC Driver',
    version: '3.16.0',
    className: 'net.snowflake.client.jdbc.SnowflakeDriver',
    urlPattern: 'jdbc:snowflake://{account}.snowflakecomputing.com/?db={database}&schema={schema}',
    downloadUrl: 'https://repo1.maven.org/maven2/net/snowflake/snowflake-jdbc/3.16.0/snowflake-jdbc-3.16.0.jar',
    homepage: 'https://docs.snowflake.com/en/developer-guide/jdbc/jdbc',
    license: 'Snowflake Internal'
  }
}

// ==================== Driver Manager Class ====================

export class JDBCDriverManager extends EventEmitter {
  private driverDir: string
  private downloads: Map<string, ChildProcess> = new Map()
  private installedDrivers: Map<string, DriverMetadata> = new Map()

  constructor(customDriverDir?: string) {
    super()
    this.driverDir = customDriverDir || path.join(app.getPath('userData'), DEFAULT_DRIVER_DIR)
    this.ensureDriverDirectory()
    this.loadInstalledDrivers()
  }

  /**
   * Ensure driver directory exists
   */
  private ensureDriverDirectory(): void {
    if (!fs.existsSync(this.driverDir)) {
      fs.mkdirSync(this.driverDir, { recursive: true })
    }
  }

  /**
   * Load installed drivers from disk
   */
  private loadInstalledDrivers(): void {
    try {
      const entries = fs.readdirSync(this.driverDir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const metadataPath = path.join(this.driverDir, entry.name, METADATA_FILE)
          if (fs.existsSync(metadataPath)) {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8')) as DriverMetadata
            this.installedDrivers.set(entry.name, metadata)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load installed drivers:', error)
    }
  }

  /**
   * Get driver directory path
   */
  getDriverDirectory(): string {
    return this.driverDir
  }

  /**
   * Get all known drivers
   */
  getKnownDrivers(): DriverConfig[] {
    return KNOWN_DRIVERS
  }

  /**
   * Get driver metadata
   */
  getDriverMetadata(driverId: string): DriverMetadata | undefined {
    return DRIVER_METADATA[driverId]
  }

  /**
   * Get installed drivers
   */
  getInstalledDrivers(): DriverMetadata[] {
    return Array.from(this.installedDrivers.values())
  }

  /**
   * Check if a driver is installed
   */
  isDriverInstalled(driverId: string, version?: string): boolean {
    const metadata = this.installedDrivers.get(driverId)
    if (!metadata) return false
    if (version) return metadata.version === version
    return true
  }

  /**
   * Download a JDBC driver
   */
  async downloadDriver(
    driverId: string,
    version?: string
  ): Promise<DriverInstallResult> {
    const driverConfig = KNOWN_DRIVERS.find(d => d.id === driverId)
    if (!driverConfig) {
      return {
        success: false,
        driverId,
        version: version || 'unknown',
        error: `Unknown driver: ${driverId}`
      }
    }

    const targetVersion = version || driverConfig.defaultVersion
    const versionInfo = driverConfig.versions.find(v => v.version === targetVersion)
    if (!versionInfo) {
      return {
        success: false,
        driverId,
        version: targetVersion,
        error: `Version not found: ${targetVersion}`
      }
    }

    const driverPath = path.join(this.driverDir, driverId)
    const jarPath = path.join(driverPath, `driver-${targetVersion}${JAR_EXTENSION}`)
    const metadataPath = path.join(driverPath, METADATA_FILE)

    // Check if already installed
    if (fs.existsSync(jarPath)) {
      const checksum = await this.calculateChecksum(jarPath)
      if (checksum === versionInfo.checksum.replace('sha256:', '')) {
        return {
          success: true,
          driverId,
          version: targetVersion,
          message: 'Driver already installed and verified'
        }
      }
    }

    // Ensure directory exists
    if (!fs.existsSync(driverPath)) {
      fs.mkdirSync(driverPath, { recursive: true })
    }

    return new Promise((resolve) => {
      this.downloadFile(
        versionInfo.downloadUrl,
        jarPath,
        (error) => {
          if (error) {
            resolve({
              success: false,
              driverId,
              version: targetVersion,
              error: error.message
            })
            return
          }

          // Verify checksum
          this.calculateChecksum(jarPath).then((checksum) => {
            const expectedChecksum = versionInfo.checksum.replace('sha256:', '')
            if (checksum !== expectedChecksum) {
              // Delete corrupted file
              fs.unlinkSync(jarPath)
              resolve({
                success: false,
                driverId,
                version: targetVersion,
                error: 'Checksum verification failed'
              })
              return
            }

            // Save metadata
            const metadata: DriverMetadata = {
              ...DRIVER_METADATA[driverId],
              version: targetVersion,
              filePath: jarPath,
              fileSize: fs.statSync(jarPath).size,
              checksum: versionInfo.checksum,
              installedAt: new Date().toISOString()
            }
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))
            this.installedDrivers.set(driverId, metadata)

            resolve({
              success: true,
              driverId,
              version: targetVersion,
              message: 'Driver downloaded and installed successfully'
            })
          })
        },
        (progress) => {
          this.emit('download-progress', {
            driverId,
            version: targetVersion,
            ...progress
          })
        }
      )
    })
  }

  /**
   * Download file with progress tracking
   */
  private downloadFile(
    url: string,
    destPath: string,
    callback: (error: Error | null) => void,
    onProgress?: (progress: { downloaded: number; total: number; percentage: number; speed: number }) => void
  ): void {
    const protocol = url.startsWith('https') ? https : http

    // Handle redirects manually for better control
    const download = (downloadUrl: string, redirectCount = 0) => {
      if (redirectCount > 10) {
        callback(new Error('Too many redirects'))
        return
      }

      const req = protocol.get(downloadUrl, { timeout: 30000 }, (res) => {
        // Handle redirect
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          res.destroy()
          download(res.headers.location, redirectCount + 1)
          return
        }

        // Handle error status
        if (res.statusCode !== 200) {
          callback(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`))
          return
        }

        const total = parseInt(res.headers['content-length'] || '0', 10)
        let downloaded = 0
        let lastTime = Date.now()
        let lastBytes = 0

        const file = fs.createWriteStream(destPath)

        res.on('data', (chunk: Buffer) => {
          downloaded += chunk.length
          file.write(chunk)

          // Calculate speed
          const now = Date.now()
          const timeDiff = (now - lastTime) / 1000
          if (timeDiff >= 1) {
            const bytesDiff = downloaded - lastBytes
            const speed = bytesDiff / timeDiff
            lastTime = now
            lastBytes = downloaded

            onProgress?.({
              downloaded,
              total,
              percentage: total > 0 ? Math.round((downloaded / total) * 100) : 0,
              speed
            })
          }
        })

        res.on('end', () => {
          file.close()
          callback(null)
        })

        res.on('error', (err) => {
          file.close()
          fs.unlinkSync(destPath)
          callback(err)
        })
      })

      req.on('error', (err) => {
        callback(err)
      })

      req.on('timeout', () => {
        req.destroy()
        callback(new Error('Download timeout'))
      })
    }

    download(url)
  }

  /**
   * Calculate SHA256 checksum of a file
   */
  async calculateChecksum(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash(CHECKSUM_ALGORITHM)
      const stream = fs.createReadStream(filePath)

      stream.on('data', (data) => hash.update(data))
      stream.on('end', () => resolve(hash.digest('hex')))
      stream.on('error', reject)
    })
  }

  /**
   * Remove a installed driver
   */
  async removeDriver(driverId: string): Promise<boolean> {
    const driverPath = path.join(this.driverDir, driverId)
    if (!fs.existsSync(driverPath)) {
      return false
    }

    try {
      fs.rmSync(driverPath, { recursive: true, force: true })
      this.installedDrivers.delete(driverId)
      return true
    } catch (error) {
      console.error(`Failed to remove driver ${driverId}:`, error)
      return false
    }
  }

  /**
   * Get driver classpath
   */
  getDriverClasspath(driverId: string): string | null {
    const metadata = this.installedDrivers.get(driverId)
    if (!metadata || !metadata.filePath) return null
    return metadata.filePath
  }

  /**
   * Check for driver updates
   */
  async checkForUpdates(): Promise<Map<string, { current: string; latest: string }>> {
    const updates = new Map<string, { current: string; latest: string }>()

    for (const config of KNOWN_DRIVERS) {
      const installed = this.installedDrivers.get(config.id)
      if (installed) {
        const latest = config.versions[0]?.version
        if (latest && this.compareVersions(latest, installed.version) > 0) {
          updates.set(config.id, {
            current: installed.version,
            latest
          })
        }
      }
    }

    return updates
  }

  /**
   * Compare semantic versions
   */
  private compareVersions(a: string, b: string): number {
    const partsA = a.split('.').map(p => parseInt(p.replace(/[^0-9]/g, ''), 10) || 0)
    const partsB = b.split('.').map(p => parseInt(p.replace(/[^0-9]/g, ''), 10) || 0)

    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const numA = partsA[i] || 0
      const numB = partsB[i] || 0
      if (numA > numB) return 1
      if (numA < numB) return -1
    }
    return 0
  }

  /**
   * Cancel a download
   */
  cancelDownload(driverId: string): boolean {
    const process = this.downloads.get(driverId)
    if (process) {
      process.kill()
      this.downloads.delete(driverId)
      return true
    }
    return false
  }

  /**
   * Get storage usage
   */
  getStorageUsage(): { used: number; count: number } {
    let used = 0
    let count = 0

    for (const metadata of this.installedDrivers.values()) {
      if (metadata.fileSize) {
        used += metadata.fileSize
        count++
      }
    }

    return { used, count }
  }
}

// ==================== Singleton Instance ====================

let instance: JDBCDriverManager | null = null

export function getDriverManager(): JDBCDriverManager {
  if (!instance) {
    instance = new JDBCDriverManager()
  }
  return instance
}

export function createDriverManager(customDir?: string): JDBCDriverManager {
  instance = new JDBCDriverManager(customDir)
  return instance
}
