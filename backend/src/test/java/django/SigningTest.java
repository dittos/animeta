package django;

import org.junit.Assert;
import org.junit.Test;

public class SigningTest {
    @Test
    public void testLoadString() throws Exception {
        byte[] value = Signing.loadString(".eJxVjcEOwiAQRP-FsyGFhrXt0bvfQBbYCmrAsG2iMf67JelBr_PmzbyFxXWJdmWq1qG_UQ5iEuGK-VKkL3mpyclWkTtleS6B7qe9e_gdiMhxswGc0oC9CXpW5I-I0A2jCuOg-xk35JQxPcC_nNqxahkTcyrZ0vOR6ktM3ecLDnM35g:1bRAys:7iVnJCJ8NWj7IXc9cLW9Pxfz6oY", "asdkfjlaskdfjklaf", "django.contrib.sessions.backends.signed_cookies", data -> data, Integer.MAX_VALUE);
        Assert.assertEquals("{\"_auth_user_backend\":\"django.contrib.auth.backends.ModelBackend\",\"_auth_user_hash\":\"66b126a35d2f1ec7aa60891d9823fa126b155366\",\"_auth_user_id\":\"1\",\"_session_expiry\":0}", new String(value));
    }
}
