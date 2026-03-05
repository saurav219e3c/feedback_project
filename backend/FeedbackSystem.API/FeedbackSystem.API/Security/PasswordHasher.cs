using System.Security.Cryptography;

namespace FeedbackSystem.API.Security;

public static class PasswordHasher
{
    private const int SaltSize = 16;
    private const int KeySize = 32;
    private const int Iterations = 100_000;

    //to hash the paswword
    public static string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, KeySize);
        return $"v1$${Iterations}$${Convert.ToBase64String(salt)}$${Convert.ToBase64String(hash)}";
    }

    //verify the the password 

    public static bool Verify(string password, string hashString)
    {
        var parts = hashString.Split("$$", StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length != 4 || parts[0] != "v1") return false;

        int iter = int.Parse(parts[1]);
        byte[] salt = Convert.FromBase64String(parts[2]);
        byte[] hash = Convert.FromBase64String(parts[3]);

        var testHash = Rfc2898DeriveBytes.Pbkdf2(password, salt, iter, HashAlgorithmName.SHA256, hash.Length);
        return CryptographicOperations.FixedTimeEquals(hash, testHash);
    }
}
