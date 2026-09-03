/**
 * A class in the unnamed module with something private in it, so that deep
 * reflection has a target that is allowed to succeed. Provided for you.
 */
public class Vault {

    private String secret = "s3cret";

    public String secret() {
        return secret;
    }
}
