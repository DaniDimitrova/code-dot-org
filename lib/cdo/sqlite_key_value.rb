require 'sqlite3'

# Simple wrapper around sqlite3 to provide a key-value interface.
module Cdo
  class SqliteKeyValue
    def initialize(file, table: 'kv', size: nil)
      @sqlite = ::SQLite3::Database.new(file)
      # Configure for better performance.
      @sqlite.journal_mode = 'memory'
      @sqlite.synchronous = 'off'
      @sqlite.auto_vacuum = 'full'
      @sqlite.mmap_size = size if size

      @sqlite.execute("create table if not exists #{table} (k blob not null primary key, v blob)")
      @select = @sqlite.prepare("select v from #{table} where k = ?")
      @replace = @sqlite.prepare("replace into #{table} values (?, ?)")
    end

    def transaction(&block)
      @sqlite.transaction(&block)
    end

    def [](key)
      rows = @select.execute!(key)
      rows.empty? ? nil : rows.first.first
    end

    def []=(key, value)
      @replace.execute!(key, value)
    end

    def close
      [@select, @replace].each(&:close)
      @sqlite.close
    end
  end
end
