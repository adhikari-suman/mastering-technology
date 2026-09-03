/**
 * A second fixture: annotated, but with no id column, and carrying one field
 * whose annotation is deliberately not @Column.
 */
class Note {

    @Column("body")
    private final String body;

    @Deprecated
    private final int revision;

    Note(String body, int revision) {
        this.body = body;
        this.revision = revision;
    }
}
