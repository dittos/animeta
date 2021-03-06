package django;

import org.junit.Assert;
import org.junit.Test;

import java.io.IOException;
import java.time.Duration;

public class SigningTest {
    @Test
    public void testLoadString() throws Exception {
        String value = Signing.loadString(".eJxVjcEOwiAQRP-FsyGFhrXt0bvfQBbYCmrAsG2iMf67JelBr_PmzbyFxXWJdmWq1qG_UQ5iEuGK-VKkL3mpyclWkTtleS6B7qe9e_gdiMhxswGc0oC9CXpW5I-I0A2jCuOg-xk35JQxPcC_nNqxahkTcyrZ0vOR6ktM3ecLDnM35g:1bRAys:7iVnJCJ8NWj7IXc9cLW9Pxfz6oY", "asdkfjlaskdfjklaf", "django.contrib.sessions.backends.signed_cookies", new TestSerializer(), null);
        Assert.assertEquals("{\"_auth_user_backend\":\"django.contrib.auth.backends.ModelBackend\",\"_auth_user_hash\":\"66b126a35d2f1ec7aa60891d9823fa126b155366\",\"_auth_user_id\":\"1\",\"_session_expiry\":0}", value);
    }

    @Test(expected = SignatureExpired.class)
    public void testLoadStringWithMaxAge() throws Exception {
        Signing.loadString(".eJxVjcEOwiAQRP-FsyGFhrXt0bvfQBbYCmrAsG2iMf67JelBr_PmzbyFxXWJdmWq1qG_UQ5iEuGK-VKkL3mpyclWkTtleS6B7qe9e_gdiMhxswGc0oC9CXpW5I-I0A2jCuOg-xk35JQxPcC_nNqxahkTcyrZ0vOR6ktM3ecLDnM35g:1bRAys:7iVnJCJ8NWj7IXc9cLW9Pxfz6oY", "asdkfjlaskdfjklaf", "django.contrib.sessions.backends.signed_cookies", new TestSerializer(), Duration.ofDays(1));
    }

    @Test
    public void testToString() throws Exception {
        String data = "{\"_auth_user_backend\":\"django.contrib.auth.backends.ModelBackend\",\"_auth_user_hash\":\"66b126a35d2f1ec7aa60891d9823fa126b155366\",\"_auth_user_id\":\"1\",\"_session_expiry\":0}";
        String signed = Signing.toString(data, "asdkfjlaskdfjklaf", "django.contrib.sessions.backends.signed_cookies", new TestSerializer(), true);
        Assert.assertEquals(data, Signing.loadString(signed, "asdkfjlaskdfjklaf", "django.contrib.sessions.backends.signed_cookies", new TestSerializer(), null));
    }

    static class TestSerializer implements Signing.Serializer<String> {
        @Override
        public byte[] serialize(String obj) throws IOException {
            return obj.getBytes();
        }

        @Override
        public String deserialize(byte[] data) throws IOException {
            return new String(data);
        }
    }
}
