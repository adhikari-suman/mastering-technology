/**
 * A parsed Maven/Gradle coordinate. Provided for you; you do not edit this
 * file.
 *
 *   org.slf4j : slf4j-api : 2.0.9
 *     group      artifact   version
 *
 * `ga()` is the identity a resolver deduplicates on — two Deps with the same
 * group and artifact are the same library, and only one of them can be on the
 * classpath.
 */
public record Dep(String group, String artifact, String version) {

    public String ga() {
        return group + ":" + artifact;
    }

    @Override
    public String toString() {
        return group + ":" + artifact + ":" + version;
    }
}
